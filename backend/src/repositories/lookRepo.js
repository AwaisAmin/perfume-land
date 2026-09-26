import { pool } from "../db/pool.js";

export async function listLookGroupsForSite() {
  const [groups] = await pool.query(`SELECT * FROM look_groups ORDER BY sort_order ASC, id ASC`);
  const [items] = await pool.query(`SELECT * FROM look_items ORDER BY look_group_id ASC, sort_order ASC, id ASC`);
  return groups.map((group) => ({
    image: group.image ?? undefined,
    items: items
      .filter((item) => item.look_group_id === group.id)
      .map((item) => ({
        handle: item.handle,
        title: item.title,
        price: item.price,
        image: item.image ?? undefined,
        top: item.top,
        left: item.left,
      })),
  }));
}

export async function listLookGroupsAdmin() {
  const [groups] = await pool.query(`SELECT * FROM look_groups ORDER BY sort_order ASC, id ASC`);
  const [items] = await pool.query(`SELECT * FROM look_items ORDER BY look_group_id ASC, sort_order ASC, id ASC`);
  return groups.map((group) => ({
    id: group.id,
    handle: group.handle,
    image: group.image,
    sortOrder: group.sort_order,
    items: items.filter((item) => item.look_group_id === group.id),
  }));
}

export async function findLookGroupById(id) {
  const [rows] = await pool.query(`SELECT * FROM look_groups WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export async function findLookItemById(id) {
  const [rows] = await pool.query(`SELECT * FROM look_items WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export async function createLookGroup(input) {
  const [maxSort] = await pool.query(`SELECT COALESCE(MAX(sort_order), -1) AS m FROM look_groups`);
  const [handleRows] = await pool.query(`SELECT COUNT(*) AS n FROM look_groups`);
  const handle = input.handle || `look-${handleRows[0].n + 1}`;
  const [result] = await pool.query(
    `INSERT INTO look_groups (handle, image, sort_order) VALUES (?, ?, ?)`,
    [handle, input.image ?? null, maxSort[0].m + 1]
  );
  return findLookGroupById(result.insertId);
}

export async function updateLookGroup(id, input) {
  const fields = [];
  const values = [];
  if (Object.prototype.hasOwnProperty.call(input, "image")) {
    fields.push("image = ?");
    values.push(input.image || null);
  }
  if (Object.prototype.hasOwnProperty.call(input, "handle") && input.handle) {
    fields.push("handle = ?");
    values.push(input.handle);
  }
  if (fields.length === 0) return findLookGroupById(id);
  values.push(id);
  await pool.query(`UPDATE look_groups SET ${fields.join(", ")} WHERE id = ?`, values);
  return findLookGroupById(id);
}

export async function deleteLookGroup(id) {
  await pool.query(`DELETE FROM look_groups WHERE id = ?`, [id]);
}

export async function reorderLookGroups(orderedIds) {
  for (const [index, id] of orderedIds.entries()) {
    await pool.query(`UPDATE look_groups SET sort_order = ? WHERE id = ?`, [index, id]);
  }
}

export async function createLookItem(groupId, input) {
  const [maxSort] = await pool.query(`SELECT COALESCE(MAX(sort_order), -1) AS m FROM look_items WHERE look_group_id = ?`, [groupId]);
  const [result] = await pool.query(
    `INSERT INTO look_items (look_group_id, handle, title, price, image, top, \`left\`, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [groupId, input.handle, input.title, input.price, input.image ?? null, input.top ?? 0, input.left ?? 0, maxSort[0].m + 1]
  );
  return findLookItemById(result.insertId);
}

const ITEM_FIELDS = {
  handle: "handle",
  title: "title",
  price: "price",
  image: "image",
  top: "top",
  left: "left",
};

export async function updateLookItem(id, input) {
  const fields = [];
  const values = [];
  for (const [key, column] of Object.entries(ITEM_FIELDS)) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      fields.push(`\`${column}\` = ?`);
      values.push(input[key] === "" ? null : input[key]);
    }
  }
  if (fields.length === 0) return findLookItemById(id);
  values.push(id);
  await pool.query(`UPDATE look_items SET ${fields.join(", ")} WHERE id = ?`, values);
  return findLookItemById(id);
}

export async function deleteLookItem(id) {
  await pool.query(`DELETE FROM look_items WHERE id = ?`, [id]);
}

export async function reorderLookItems(groupId, orderedIds) {
  for (const [index, id] of orderedIds.entries()) {
    await pool.query(`UPDATE look_items SET sort_order = ? WHERE id = ? AND look_group_id = ?`, [index, id, groupId]);
  }
}
