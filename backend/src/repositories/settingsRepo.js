import { pool } from "../db/pool.js";

export async function getSetting(key) {
  const [rows] = await pool.query(`SELECT value FROM settings WHERE \`key\` = ?`, [key]);
  if (!rows[0]) return undefined;
  const raw = rows[0].value;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function getAllSettings() {
  const [rows] = await pool.query(`SELECT \`key\`, value FROM settings`);
  const result = {};
  for (const row of rows) {
    result[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
  }
  return result;
}

export async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO settings (\`key\`, value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE value = VALUES(value)`,
    [key, JSON.stringify(value)]
  );
}

export async function touchUpdatedAt() {
  const now = new Date().toISOString();
  await setSetting("updatedAt", now);
  return now;
}
