import { pool } from "../db/pool.js";
import { slugify } from "../utils/slug.js";

function mapCollection(row) {
  const collection = {
    id: row.public_id,
    handle: row.handle,
    kicker: row.kicker ?? "",
    title: row.title,
  };
  if (row.page_title) collection.pageTitle = row.page_title;
  if (row.hero_image) collection.heroImage = row.hero_image;
  return collection;
}

export async function listCollectionsRaw() {
  const [rows] = await pool.query(`SELECT * FROM collections ORDER BY sort_order ASC, id ASC`);
  return rows;
}

export async function listCollectionsForSite() {
  const rows = await listCollectionsRaw();
  return rows.map((row) => ({ ...mapCollection(row), products: [] }));
}

export async function findCollectionById(id) {
  const [rows] = await pool.query(`SELECT * FROM collections WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export async function findCollectionByHandle(handle) {
  const [rows] = await pool.query(`SELECT * FROM collections WHERE handle = ?`, [handle]);
  return rows[0] ?? null;
}

export async function countProductsInCollection(collectionId) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS n FROM products WHERE collection_id = ?`, [collectionId]);
  return rows[0].n;
}

function uniquePublicId(rows, base) {
  const taken = new Set(rows.map((r) => r.public_id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function createCollection(input) {
  const existing = await listCollectionsRaw();
  const handle = input.handle || slugify(input.title);
  const publicId = uniquePublicId(existing, handle);
  const [maxSort] = await pool.query(`SELECT COALESCE(MAX(sort_order), -1) AS m FROM collections`);
  const sortOrder = maxSort[0].m + 1;

  const [result] = await pool.query(
    `INSERT INTO collections (public_id, handle, kicker, title, page_title, hero_image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [publicId, handle, input.kicker ?? "", input.title, input.pageTitle ?? null, input.heroImage ?? null, sortOrder]
  );
  return findCollectionById(result.insertId);
}

export async function updateCollection(id, input) {
  const fields = [];
  const values = [];
  const map = {
    handle: "handle",
    kicker: "kicker",
    title: "title",
    pageTitle: "page_title",
    heroImage: "hero_image",
  };
  for (const [key, column] of Object.entries(map)) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      fields.push(`${column} = ?`);
      values.push(input[key] === "" && column !== "kicker" ? null : input[key]);
    }
  }
  if (fields.length === 0) return findCollectionById(id);
  values.push(id);
  await pool.query(`UPDATE collections SET ${fields.join(", ")} WHERE id = ?`, values);
  return findCollectionById(id);
}

export async function deleteCollection(id) {
  await pool.query(`DELETE FROM collections WHERE id = ?`, [id]);
}

export async function reorderCollections(orderedIds) {
  for (const [index, id] of orderedIds.entries()) {
    await pool.query(`UPDATE collections SET sort_order = ? WHERE id = ?`, [index, id]);
  }
}

export { mapCollection };
