import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pool } from "./pool.js";
import { config } from "../config.js";
import { triggerRevalidate } from "../services/revalidate.js";

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "schema.sql");

async function migrate() {
  const sql = readFileSync(schemaPath, "utf8");
  const statements = sql
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);

  const conn = await pool.getConnection();
  try {
    for (const statement of statements) {
      await conn.query(statement);
    }
    console.log(`Migrated ${statements.length} statements against database "${config.DB_NAME}".`);
    const changed = await backfillProductVariants(conn);
    if (changed) {
      console.log(`Asking the website (${config.SITE_URL}) to refresh its cache...`);
      await triggerRevalidate();
    }
  } finally {
    conn.release();
    await pool.end();
  }
}

// Existing dev databases from before variants existed have products with no
// rows in product_variants yet. Give each of those a single "Perfume"
// variant built from that product's own price/size/etc columns, so nothing
// on the site breaks. Products that already have at least one variant (e.g.
// freshly reseeded, or already migrated) are left alone — safe to re-run.
async function backfillProductVariants(conn) {
  const [rows] = await conn.query(
    `SELECT p.* FROM products p
     LEFT JOIN product_variants v ON v.product_id = p.id
     WHERE v.id IS NULL`
  );
  if (rows.length === 0) {
    console.log("No products need a backfilled variant.");
    return false;
  }
  for (const product of rows) {
    await conn.query(
      `INSERT INTO product_variants (product_id, public_id, type, size, price, compare_at_price, in_stock, sort_order)
       VALUES (?, ?, 'Perfume', ?, ?, ?, ?, 0)`,
      [
        product.id,
        `${product.public_id}-v1`,
        product.size || "50ml",
        product.price,
        product.compare_at_price,
        product.in_stock,
      ]
    );
  }
  console.log(`Backfilled a default "Perfume" variant for ${rows.length} existing product(s).`);
  return true;
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
