import { pool } from "../db/pool.js";
import { slugify } from "../utils/slug.js";
import { mapVariant, insertVariantsTx, replaceVariantsTx, syncProductSummaryColumnsTx } from "./productVariantsRepo.js";

// `variants` must already be ordered (sort_order ASC) — the first one is the
// product's default and its price/compareAtPrice/size are mirrored onto the
// top-level product fields, per the public API contract. `inStock` is true
// if ANY variant is in stock (not just the default one) — the site computes
// its own min price and per-variant availability from the `variants` array.
export function mapProduct(row, variants = []) {
  const first = variants[0];
  const product = {
    id: row.public_id,
    handle: row.handle,
    title: row.title,
    price: first ? first.price : row.price,
  };
  if (row.kicker) product.kicker = row.kicker;
  const compareAtPrice = first ? first.compare_at_price : row.compare_at_price;
  if (compareAtPrice !== null && compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
  if (row.image) product.image = row.image;
  if (row.gender) product.gender = row.gender;
  product.inStock = variants.length ? variants.some((v) => v.in_stock) : Boolean(row.in_stock);
  if (row.description) product.description = row.description;
  const size = first ? first.size : row.size;
  if (size) product.size = size;
  if (row.stock_count !== null && row.stock_count !== undefined) product.stockCount = row.stock_count;
  product.variants = variants.map(mapVariant);
  return product;
}

export async function listProductsForSite() {
  const [rows] = await pool.query(
    `SELECT * FROM products ORDER BY collection_id ASC, sort_order ASC, id ASC`
  );
  return rows;
}

export async function listProductsAdmin({ search, collectionId, page = 1, pageSize = 50 } = {}) {
  const where = [];
  const values = [];
  if (search) {
    where.push("(p.title LIKE ? OR p.handle LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
  }
  if (collectionId) {
    where.push("p.collection_id = ?");
    values.push(collectionId);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query(
    `SELECT p.*, c.title AS collection_title, c.handle AS collection_handle
     FROM products p
     JOIN collections c ON c.id = p.collection_id
     ${whereSql}
     ORDER BY p.collection_id ASC, p.sort_order ASC, p.id ASC
     LIMIT ? OFFSET ?`,
    [...values, pageSize, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS n FROM products p ${whereSql}`,
    values
  );
  return { rows, total: countRows[0].n };
}

export async function findProductById(id) {
  const [rows] = await pool.query(`SELECT * FROM products WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export async function findProductByHandle(handle, excludeId) {
  const [rows] = await pool.query(
    `SELECT * FROM products WHERE handle = ? ${excludeId ? "AND id != ?" : ""}`,
    excludeId ? [handle, excludeId] : [handle]
  );
  return rows[0] ?? null;
}

// `input.variants` must be a non-empty, already-validated array (see
// utils/variantSchema.js). The product row and its variants are created in
// ONE transaction. The public id is derived from the row's own auto-increment
// id (set in a second statement inside the same transaction, once it's
// known) rather than "max existing id + 1", so two concurrent creates can
// never race onto the same public id.
export async function createProduct(input) {
  const handle = input.handle || slugify(input.title);
  const first = input.variants[0];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [maxSort] = await conn.query(
      `SELECT COALESCE(MAX(sort_order), -1) AS m FROM products WHERE collection_id = ?`,
      [input.collectionId]
    );
    const sortOrder = maxSort[0].m + 1;

    // Temporary placeholder for the UNIQUE public_id column — replaced with
    // the real "product-<id>" value in the next statement, once `id` (the
    // auto-increment primary key, inherently race-free) is known.
    const tempPublicId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const [result] = await conn.query(
      `INSERT INTO products
         (public_id, collection_id, handle, title, kicker, price, compare_at_price, image, gender, in_stock, description, size, stock_count, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tempPublicId,
        input.collectionId,
        handle,
        input.title,
        input.kicker ?? null,
        first.price,
        first.compareAtPrice ?? null,
        input.image ?? null,
        input.gender ?? null,
        first.inStock === false ? 0 : 1,
        input.description ?? null,
        first.size,
        input.stockCount ?? null,
        sortOrder,
      ]
    );
    const productId = result.insertId;
    const publicId = `product-${productId}`;
    await conn.query(`UPDATE products SET public_id = ? WHERE id = ?`, [publicId, productId]);

    await insertVariantsTx(conn, productId, publicId, input.variants);
    await syncProductSummaryColumnsTx(conn, productId);

    await conn.commit();
    return findProductById(productId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Note: price/compareAtPrice/size are NOT here — they are derived from the
// product's first variant (see productVariantsRepo) and only ever change
// through the variants endpoint. `inStock` likewise reflects "any variant in
// stock" and isn't independently settable.
const UPDATABLE = {
  collectionId: "collection_id",
  handle: "handle",
  title: "title",
  kicker: "kicker",
  image: "image",
  gender: "gender",
  description: "description",
  stockCount: "stock_count",
};

// Nullable fields: sending `null` (or "") explicitly clears them. Fields not
// present in the payload at all are left untouched.
const NULLABLE_FIELDS = new Set(["kicker", "image", "gender", "description", "stockCount"]);

function updateProductFieldsTx(conn, id, input) {
  const fields = [];
  const values = [];
  for (const [key, column] of Object.entries(UPDATABLE)) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      let value = input[key];
      if (value === "" && NULLABLE_FIELDS.has(key)) value = null;
      fields.push(`${column} = ?`);
      values.push(value);
    }
  }
  if (fields.length === 0) return Promise.resolve();
  values.push(id);
  return conn.query(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
}

export async function updateProduct(id, input) {
  const conn = await pool.getConnection();
  try {
    await updateProductFieldsTx(conn, id, input);
  } finally {
    conn.release();
  }
  return findProductById(id);
}

// Updates the product's own fields and (optionally) replaces its variants in
// ONE transaction, so a save from the CRM's single form submission either
// fully succeeds or fully rolls back — the response is always the true
// final state, never a partial one.
export async function updateProductWithVariants(id, productInput, variants) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await updateProductFieldsTx(conn, id, productInput);

    if (variants) {
      const [rows] = await conn.query(`SELECT public_id FROM products WHERE id = ?`, [id]);
      if (!rows[0]) throw Object.assign(new Error("Product not found."), { status: 404 });
      await replaceVariantsTx(conn, id, rows[0].public_id, variants);
    }
    await syncProductSummaryColumnsTx(conn, id);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return findProductById(id);
}

export async function deleteProduct(id) {
  await pool.query(`DELETE FROM products WHERE id = ?`, [id]);
}

export async function reorderProducts(collectionId, orderedIds) {
  for (const [index, id] of orderedIds.entries()) {
    await pool.query(`UPDATE products SET sort_order = ? WHERE id = ? AND collection_id = ?`, [index, id, collectionId]);
  }
}
