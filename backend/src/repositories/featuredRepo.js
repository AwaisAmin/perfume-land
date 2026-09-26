import { pool } from "../db/pool.js";

export async function getFeaturedProduct() {
  const [rows] = await pool.query(`SELECT * FROM featured_product WHERE id = 1`);
  const [variants] = await pool.query(
    `SELECT * FROM featured_variants WHERE featured_product_id = 1 ORDER BY sort_order ASC, id ASC`
  );
  return { product: rows[0] ?? null, variants };
}

export function mapFeatured(product, variants) {
  const result = {
    handle: product.handle,
    title: product.title,
    description: product.description,
  };
  if (product.image) result.image = product.image;
  result.variants = variants.map((v) => {
    const variant = { size: v.size, price: v.price };
    if (v.compare_at_price !== null && v.compare_at_price !== undefined) variant.compareAtPrice = v.compare_at_price;
    return variant;
  });
  return result;
}

export async function updateFeaturedProduct(input) {
  await pool.query(
    `INSERT INTO featured_product (id, handle, title, description, image) VALUES (1, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE handle = VALUES(handle), title = VALUES(title), description = VALUES(description), image = VALUES(image)`,
    [input.handle, input.title, input.description, input.image ?? null]
  );
  return getFeaturedProduct();
}

export async function replaceFeaturedVariants(variants) {
  await pool.query(`DELETE FROM featured_variants WHERE featured_product_id = 1`);
  for (const [index, variant] of variants.entries()) {
    await pool.query(
      `INSERT INTO featured_variants (featured_product_id, size, price, compare_at_price, sort_order) VALUES (1, ?, ?, ?, ?)`,
      [variant.size, variant.price, variant.compareAtPrice ?? null, index]
    );
  }
  return getFeaturedProduct();
}
