import { Router } from "express";
import { getSitePayload } from "../repositories/siteRepo.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true });
});

router.get("/site", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const payload = await getSitePayload();
  res.json(payload);
});

export default router;
