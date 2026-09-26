import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { cookieParserMiddleware } from "./middleware/cookies.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import publicRouter from "./routes/public.js";
import adminRouter from "./routes/admin/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");
const adminUiDir = path.join(__dirname, "..", "admin");

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.TRUST_PROXY);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", config.SITE_URL, config.PUBLIC_BASE_URL],
          // Hero video previews come from the site (/videos/...) or /uploads.
          mediaSrc: ["'self'", config.SITE_URL, config.PUBLIC_BASE_URL],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParserMiddleware);

  const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false });
  app.use("/api", apiLimiter);

  app.use(
    "/uploads",
    (req, res, next) => {
      // These are plain image files, not HTML/JS — lock them down so a
      // maliciously-named upload can never be executed as a script or embed
      // other content in the browser.
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'");
      res.setHeader("Content-Disposition", "inline");
      next();
    },
    express.static(uploadsDir, { fallthrough: false, index: false, dotfiles: "deny" })
  );

  app.use("/api/public", publicRouter);
  app.use("/api/admin", adminRouter);

  app.use("/admin", express.static(adminUiDir, { extensions: ["html"] }));
  app.get("/admin/*splat", (req, res) => {
    res.sendFile(path.join(adminUiDir, "index.html"));
  });

  app.get("/", (req, res) => {
    res.json({ name: "perfume-land-backend", ok: true });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
