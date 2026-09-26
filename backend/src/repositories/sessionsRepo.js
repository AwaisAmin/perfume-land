import crypto from "node:crypto";
import { pool } from "../db/pool.js";

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminId) {
  const token = crypto.randomBytes(32).toString("hex");
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await pool.query(`INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)`, [id, adminId, expiresAt]);
  return { token, expiresAt };
}

export async function findSessionByToken(token) {
  const id = hashToken(token);
  const [rows] = await pool.query(`SELECT * FROM sessions WHERE id = ?`, [id]);
  const session = rows[0];
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await pool.query(`DELETE FROM sessions WHERE id = ?`, [id]);
    return null;
  }
  return session;
}

export async function deleteSessionByToken(token) {
  const id = hashToken(token);
  await pool.query(`DELETE FROM sessions WHERE id = ?`, [id]);
}

export async function deleteExpiredSessions() {
  await pool.query(`DELETE FROM sessions WHERE expires_at < NOW()`);
}

export async function deleteExpiredSessionsForAdmin(adminId) {
  await pool.query(`DELETE FROM sessions WHERE admin_id = ? AND expires_at < NOW()`, [adminId]);
}

export const SESSION_TTL = SESSION_TTL_MS;
