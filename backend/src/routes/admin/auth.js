import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { findAdminByEmail } from "../../repositories/adminsRepo.js";
import { createSession, deleteSessionByToken, deleteExpiredSessionsForAdmin, SESSION_TTL } from "../../repositories/sessionsRepo.js";
import { requireAuth, setSessionCookie, clearSessionCookie, SESSION_COOKIE } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";

const router = Router();

// A precomputed bcrypt hash used only to keep the login response timing
// similar for unknown emails vs. wrong passwords (no real password behind it).
const DUMMY_HASH = "$2a$12$yzQi/NUTg/gmn1aqJ3s/7OG47T7BGEbB4ERorKDIWuVmuYEC71btq";

function normalizedEmailKey(req) {
  const email = req.body && typeof req.body.email === "string" ? req.body.email : "";
  return email.trim().toLowerCase() || "unknown";
}

// Keyed by IP + email: stops brute-forcing one account from one machine.
const loginLimiterByIpAndEmail = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${normalizedEmailKey(req)}`,
  message: { error: "Too many login attempts. Please try again later." },
});

// Keyed by email only: stops a distributed attack against one account from
// many different IPs.
const loginLimiterByEmail = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: normalizedEmailKey,
  message: { error: "Too many login attempts for this account. Please try again later." },
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  "/login",
  loginLimiterByIpAndEmail,
  loginLimiterByEmail,
  validateBody(loginSchema),
  async (req, res) => {
    const { email, password } = req.body;
    const admin = await findAdminByEmail(email);
    const genericError = () => res.status(401).json({ error: "Invalid email or password." });

    if (!admin) {
      // Still run bcrypt to keep response timing similar whether or not the account exists.
      await bcrypt.compare(password, DUMMY_HASH);
      return genericError();
    }

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return genericError();

    // Housekeeping: clear out this account's own expired sessions on every
    // successful login (in addition to the periodic sweep in server.js).
    await deleteExpiredSessionsForAdmin(admin.id);

    const { token } = await createSession(admin.id);
    setSessionCookie(res, token, SESSION_TTL);
    res.json({ ok: true, admin: { id: admin.id, email: admin.email } });
  }
);

router.post("/logout", async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) await deleteSessionByToken(token);
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
