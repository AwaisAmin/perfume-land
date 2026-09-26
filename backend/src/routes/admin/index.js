import { Router } from "express";
import { config } from "../../config.js";
import { requireAuth, requireCsrfHeader } from "../../middleware/auth.js";
import { pool } from "../../db/pool.js";
import { revalidateAndReport } from "../../services/revalidate.js";
import authRouter from "./auth.js";
import productsRouter from "./products.js";
import collectionsRouter from "./collections.js";
import featuredRouter from "./featured.js";
import lookRouter from "./look.js";
import settingsRouter from "./settings.js";
import uploadsRouter from "./uploads.js";

const router = Router();

// The CSRF header is required on every state-changing request in this
// router, including login/logout (GET requests, e.g. /auth/me, are exempt —
// see requireCsrfHeader).
router.use(requireCsrfHeader);

router.use("/auth", authRouter);

// Everything below also requires a signed-in admin.
router.use(requireAuth);

router.get("/config", (req, res) => {
  res.json({ siteUrl: config.SITE_URL, publicBaseUrl: config.PUBLIC_BASE_URL });
});

router.get("/dashboard", async (req, res) => {
  const [[collections], [products], [outOfStock]] = await Promise.all([
    pool.query("SELECT COUNT(*) AS n FROM collections"),
    pool.query("SELECT COUNT(*) AS n FROM products"),
    pool.query("SELECT COUNT(*) AS n FROM products WHERE in_stock = 0"),
  ]);
  res.json({
    collections: collections[0].n,
    products: products[0].n,
    outOfStock: outOfStock[0].n,
  });
});

// Lets the CRM manually ask the website to refresh its cache (e.g. after a
// seed/migrate run, or just to be sure) — not tied to any particular write.
router.post("/revalidate", async (req, res) => {
  const result = await revalidateAndReport();
  res.json({ siteOk: result.ok });
});

router.use("/products", productsRouter);
router.use("/collections", collectionsRouter);
router.use("/featured-product", featuredRouter);
router.use("/look-groups", lookRouter);
router.use("/settings", settingsRouter);
router.use("/uploads", uploadsRouter);

export default router;
