import { pool } from "../db/pool.js";

export async function findAdminByEmail(email) {
  const [rows] = await pool.query(`SELECT * FROM admins WHERE email = ?`, [email.toLowerCase().trim()]);
  return rows[0] ?? null;
}

export async function findAdminById(id) {
  const [rows] = await pool.query(`SELECT * FROM admins WHERE id = ?`, [id]);
  return rows[0] ?? null;
}
