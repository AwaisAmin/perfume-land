import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { pool } from "../src/db/pool.js";
import { createApp } from "../src/app.js";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const schemaPath = path.join(rootDir, "src", "db", "schema.sql");
const seedPath = path.join(rootDir, "src", "db", "seed-data.json");

// Fake, test-only login values for the throwaway test database (not real credentials).
export const TEST_CREDENTIALS = {
  valid: "TestPassword123",
  wrong: "totally-wrong",
  unknownUser: "whatever12345",
};

export async function resetDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    const [tables] = await conn.query("SHOW TABLES");
    for (const row of tables) {
      const table = Object.values(row)[0];
      await conn.query(`DROP TABLE IF EXISTS \`${table}\``);
    }
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    const sql = readFileSync(schemaPath, "utf8");
    const statements = sql.split(/;\s*(?:\n|$)/).map((s) => s.trim()).filter(Boolean);
    for (const statement of statements) {
      await conn.query(statement);
    }
  } finally {
    conn.release();
  }
}

export async function seedDatabase() {
  const data = JSON.parse(readFileSync(seedPath, "utf8"));
  const conn = await pool.getConnection();
  try {
    let productCounter = 0;
    await conn.beginTransaction();

    for (const [collectionIndex, collection] of data.collections.entries()) {
      const [result] = await conn.query(
        `INSERT INTO collections (public_id, handle, kicker, title, page_title, hero_image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [collection.id, collection.handle, collection.kicker ?? "", collection.title, collection.pageTitle ?? null, collection.heroImage ?? null, collectionIndex]
      );
      const collectionId = result.insertId;
      for (const [productIndex, product] of collection.products.entries()) {
        productCounter += 1;
        const [productResult] = await conn.query(
          `INSERT INTO products (public_id, collection_id, handle, title, kicker, price, compare_at_price, image, gender, in_stock, description, size, stock_count, sort_order)
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
          await conn.query(
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
    await conn.query(`INSERT INTO featured_product (id, handle, title, description, image) VALUES (1, ?, ?, ?, ?)`, [fp.handle, fp.title, fp.description, fp.image ?? null]);
    for (const [i, variant] of fp.variants.entries()) {
      await conn.query(`INSERT INTO featured_variants (featured_product_id, size, price, compare_at_price, sort_order) VALUES (1, ?, ?, ?, ?)`, [variant.size, variant.price, variant.compareAtPrice ?? null, i]);
    }

    for (const [groupIndex, group] of data.shopTheLookGroups.entries()) {
      const [result] = await conn.query(`INSERT INTO look_groups (handle, image, sort_order) VALUES (?, ?, ?)`, [`look-${groupIndex + 1}`, group.image ?? null, groupIndex]);
      const groupId = result.insertId;
      for (const [itemIndex, item] of group.items.entries()) {
        await conn.query(
          `INSERT INTO look_items (look_group_id, handle, title, price, image, top, \`left\`, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
      await conn.query(`INSERT INTO settings (\`key\`, value) VALUES (?, ?)`, [key, JSON.stringify(value)]);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return data;
}

export async function createTestAdmin(email = "test-admin@example.com", password = TEST_CREDENTIALS.valid) {
  const hash = await bcrypt.hash(password, 4); // low cost factor: tests only
  await pool.query(`INSERT INTO admins (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`, [email, hash]);
  return { email, password };
}

export function buildApp() {
  return createApp();
}

export async function loginAgent(agent, email, password) {
  const res = await agent.post("/api/admin/auth/login").set("X-Requested-With", "perfume-land-admin").send({ email, password });
  return res;
}

export const AUTH_HEADER = { "X-Requested-With": "perfume-land-admin" };
