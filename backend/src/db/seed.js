import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pool, withTransaction } from "./pool.js";
import { config } from "../config.js";
import { triggerRevalidate } from "../services/revalidate.js";

const seedPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "seed-data.json");
const force = process.argv.includes("--force");

async function tableIsEmpty(conn, table) {
  const [rows] = await conn.query(`SELECT COUNT(*) AS n FROM ${table}`);
  return rows[0].n === 0;
}

async function seed() {
  const data = JSON.parse(readFileSync(seedPath, "utf8"));
  const conn = await pool.getConnection();

  try {
    const empty = await tableIsEmpty(conn, "collections");
    if (!empty && !force) {
      console.log(`Database "${config.DB_NAME}" already has data. Skipping seed (use --force to wipe and reseed).`);
      return;
    }

    if (!empty && force) {
      console.log("Force flag set: clearing existing content tables...");
      await conn.query("SET FOREIGN_KEY_CHECKS = 0");
      for (const table of ["look_items", "look_groups", "featured_variants", "featured_product", "product_variants", "products", "collections", "settings"]) {
        await conn.query(`TRUNCATE TABLE ${table}`);
      }
      await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    }

    await withTransaction(async (tx) => {
      let productCounter = 0;

      for (const [collectionIndex, collection] of data.collections.entries()) {
        const [result] = await tx.query(
          `INSERT INTO collections (public_id, handle, kicker, title, page_title, hero_image, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            collection.id,
            collection.handle,
            collection.kicker ?? "",
            collection.title,
            collection.pageTitle ?? null,
            collection.heroImage ?? null,
            collectionIndex,
          ]
        );
        const collectionId = result.insertId;

        for (const [productIndex, product] of collection.products.entries()) {
          productCounter += 1;
          const [productResult] = await tx.query(
            `INSERT INTO products
               (public_id, collection_id, handle, title, kicker, price, compare_at_price, image, gender, in_stock, description, size, stock_count, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product.id ?? `product-${productCounter}`,
              collectionId,
              product.handle,
              product.title,
              product.kicker ?? null,
              product.price,
              product.compareAtPrice ?? null,
              product.image ?? null,
              product.gender ?? null,
              product.inStock === false ? 0 : 1,
              product.description ?? null,
              product.size ?? null,
              product.stockCount ?? null,
              productIndex,
            ]
          );
          const productId = productResult.insertId;

          for (const [variantIndex, variant] of (product.variants ?? []).entries()) {
            await tx.query(
              `INSERT INTO product_variants (product_id, public_id, type, size, price, compare_at_price, in_stock, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                productId,
                variant.id,
                variant.type ?? null,
                variant.size,
                variant.price,
                variant.compareAtPrice ?? null,
                variant.inStock === false ? 0 : 1,
                variantIndex,
              ]
            );
          }
        }
      }

      const fp = data.featuredProduct;
      await tx.query(
        `INSERT INTO featured_product (id, handle, title, description, image) VALUES (1, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE handle = VALUES(handle), title = VALUES(title), description = VALUES(description), image = VALUES(image)`,
        [fp.handle, fp.title, fp.description, fp.image ?? null]
      );
      for (const [i, variant] of fp.variants.entries()) {
        await tx.query(
          `INSERT INTO featured_variants (featured_product_id, size, price, compare_at_price, sort_order) VALUES (1, ?, ?, ?, ?)`,
          [variant.size, variant.price, variant.compareAtPrice ?? null, i]
        );
      }

      for (const [groupIndex, group] of data.shopTheLookGroups.entries()) {
        const [result] = await tx.query(
          `INSERT INTO look_groups (handle, image, sort_order) VALUES (?, ?, ?)`,
          [`look-${groupIndex + 1}`, group.image ?? null, groupIndex]
        );
        const groupId = result.insertId;
        for (const [itemIndex, item] of group.items.entries()) {
          await tx.query(
            `INSERT INTO look_items (look_group_id, handle, title, price, image, top, \`left\`, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [groupId, item.handle, item.title, item.price, item.image ?? null, item.top, item.left, itemIndex]
          );
        }
      }

      const settingsEntries = {
        bottleImage: data.bottleImage,
        beforeAfterImages: data.beforeAfterImages,
        brand: data.brand,
        contact: data.contact,
        nav: data.nav,
        announcements: data.announcements,
        freeShippingThreshold: data.freeShippingThreshold,
        content: data.content,
        updatedAt: new Date().toISOString(),
      };
      for (const [key, value] of Object.entries(settingsEntries)) {
        await tx.query(
          `INSERT INTO settings (\`key\`, value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE value = VALUES(value)`,
          [key, JSON.stringify(value)]
        );
      }
    });

    console.log(`Seeded database "${config.DB_NAME}": ${data.collections.length} collections, ${data.collections.reduce((n, c) => n + c.products.length, 0)} products.`);

    // The website's data cache doesn't know this happened outside the CRM —
    // tell it to refresh. Logs (doesn't throw) if the site isn't reachable.
    console.log(`Asking the website (${config.SITE_URL}) to refresh its cache...`);
    await triggerRevalidate();
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
