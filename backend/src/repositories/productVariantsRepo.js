import { pool } from "../db/pool.js";

export function mapVariant(row) {
  const variant = {
    id: row.public_id,
    type: row.type ?? null,
    size: row.size,
    price: row.price,
  };
  if (row.compare_at_price !== null && row.compare_at_price !== undefined) variant.compareAtPrice = row.compare_at_price;
  variant.inStock = Boolean(row.in_stock);
  return variant;
}

export async function listVariantsForProduct(productId) {
  const [rows] = await pool.query(
    `SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC`,
    [productId]
  );
  return rows;
}

async function listVariantsForProductTx(conn, productId) {
  const [rows] = await conn.query(
    `SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC`,
    [productId]
  );
  return rows;
}

// Bulk-fetch for the public site payload / admin list, keyed by product_id.
export async function listVariantsGroupedByProduct(productIds) {
  if (!productIds || productIds.length === 0) return new Map();
  const [rows] = await pool.query(
    `SELECT * FROM product_variants WHERE product_id IN (?) ORDER BY product_id ASC, sort_order ASC, id ASC`,
    [productIds]
  );
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.product_id)) grouped.set(row.product_id, []);
    grouped.get(row.product_id).push(row);
  }
  return grouped;
}

export async function listAllVariantsGrouped() {
  const [rows] = await pool.query(`SELECT * FROM product_variants ORDER BY product_id ASC, sort_order ASC, id ASC`);
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.product_id)) grouped.set(row.product_id, []);
    grouped.get(row.product_id).push(row);
  }
  return grouped;
}

// Price range + variant count per product, for the admin product list.
export async function summarizeVariants(productIds) {
  if (!productIds || productIds.length === 0) return new Map();
  const [rows] = await pool.query(
    `SELECT product_id, COUNT(*) AS variant_count, MIN(price) AS min_price, MAX(price) AS max_price
     FROM product_variants WHERE product_id IN (?) GROUP BY product_id`,
    [productIds]
  );
  const summary = new Map();
  for (const row of rows) {
    summary.set(row.product_id, { variantCount: row.variant_count, minPrice: row.min_price, maxPrice: row.max_price });
  }
  return summary;
}

export async function findVariantById(id) {
  const [rows] = await pool.query(`SELECT * FROM product_variants WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

async function insertOneVariantTx(conn, productId, publicId, variant, sortOrder) {
  await conn.query(
    `INSERT INTO product_variants (product_id, public_id, type, size, price, compare_at_price, in_stock, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [productId, publicId, variant.type ?? null, variant.size, variant.price, variant.compareAtPrice ?? null, variant.inStock === false ? 0 : 1, sortOrder]
  );
}

// Inserts a brand-new product's variants (numbered v1, v2, ...) using an
// already-open transaction connection — the caller (productsRepo.createProduct)
// commits/rolls back the whole product+variants insert together.
export async function insertVariantsTx(conn, productId, productPublicId, variants) {
  for (const [index, variant] of variants.entries()) {
    await insertOneVariantTx(conn, productId, `${productPublicId}-v${index + 1}`, variant, index);
  }
}

// Reconciles an existing product's variant list against a new array from the
// CRM. To avoid ever hitting the (product_id, type, size) unique constraint
// transiently while reordering/renaming rows, this deletes every existing
// variant first and reinserts fresh inside the same transaction — rows whose
// `id` (public_id) matches one that existed before keep that id (so the
// public id stays stable across an edit); brand-new rows get the next free
// "-vN" suffix. Runs inside `conn`'s existing transaction — the caller is
// responsible for BEGIN/COMMIT/ROLLBACK.
export async function replaceVariantsTx(conn, productId, productPublicId, variants) {
  const [currentRows] = await conn.query(`SELECT public_id FROM product_variants WHERE product_id = ?`, [productId]);
  const currentIds = new Set(currentRows.map((row) => row.public_id));

  await conn.query(`DELETE FROM product_variants WHERE product_id = ?`, [productId]);

  const prefix = `${productPublicId}-v`;
  let nextSuffix = 1;
  for (const id of currentIds) {
    if (id.startsWith(prefix)) {
      const n = Number(id.slice(prefix.length));
      if (Number.isFinite(n)) nextSuffix = Math.max(nextSuffix, n + 1);
    }
  }

  for (const [index, variant] of variants.entries()) {
    const publicId = variant.id && currentIds.has(variant.id) ? variant.id : `${prefix}${nextSuffix++}`;
    await insertOneVariantTx(conn, productId, publicId, variant, index);
  }

  return listVariantsForProductTx(conn, productId);
}

// Standalone version (own transaction) — kept for the dedicated
// PUT /api/admin/products/:id/variants endpoint.
export async function replaceVariantsForProduct(productId, productPublicId, variants) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await replaceVariantsTx(conn, productId, productPublicId, variants);
    await syncProductSummaryColumnsTx(conn, productId);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Keeps the legacy summary columns on `products` (price/compare_at_price/
// size/in_stock) in sync with variants: price/compareAtPrice/size mirror the
// first (default, sort_order 0) variant; in_stock is true if ANY variant is
// in stock (the public payload's product.inStock means "available in some
// option", not just the default one).
async function syncProductSummaryColumnsTx(conn, productId) {
  const variants = await listVariantsForProductTx(conn, productId);
  const first = variants[0];
  if (!first) return;
  const anyInStock = variants.some((v) => v.in_stock);
  await conn.query(
    `UPDATE products SET price = ?, compare_at_price = ?, size = ?, in_stock = ? WHERE id = ?`,
    [first.price, first.compare_at_price, first.size, anyInStock ? 1 : 0, productId]
  );
}

export async function syncProductSummaryColumns(productId) {
  const conn = await pool.getConnection();
  try {
    await syncProductSummaryColumnsTx(conn, productId);
  } finally {
    conn.release();
  }
}

export { syncProductSummaryColumnsTx };
