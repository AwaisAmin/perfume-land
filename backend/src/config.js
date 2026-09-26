import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envFile = process.env.NODE_ENV === "test" && existsSync(path.join(rootDir, ".env.test"))
  ? ".env.test"
  : ".env";
dotenv.config({ path: path.join(rootDir, envFile) });

const WEAK_SECRETS = new Set([
  "",
  "replace-with-a-long-random-string",
  "secret",
  "changeme",
]);

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    DB_HOST: z.string().min(1).default("127.0.0.1"),
    DB_PORT: z.coerce.number().int().positive().default(3306),
    DB_USER: z.string().min(1).default("root"),
    DB_PASSWORD: z.string().default(""),
    DB_NAME: z.string().min(1),

    PUBLIC_BASE_URL: z.string().url(),
    SITE_URL: z.string().url(),
    CORS_ORIGIN: z.string().url(),

    // Express "trust proxy" setting. "false" (default) = don't trust any
    // proxy headers; a number = trust that many hops from the client (set
    // this to 1 when running behind a single reverse proxy/load balancer);
    // "true" trusts all hops (only sensible behind a fully-controlled proxy).
    TRUST_PROXY: z
      .string()
      .optional()
      .default("false")
      .transform((value) => {
        if (value === "false" || value === "") return false;
        if (value === "true") return true;
        const n = Number(value);
        return Number.isInteger(n) && n >= 0 ? n : false;
      }),

    REVALIDATE_SECRET: z.string().min(20, "REVALIDATE_SECRET must be at least 20 characters"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production") {
      if (WEAK_SECRETS.has(env.REVALIDATE_SECRET)) {
        ctx.addIssue({ code: "custom", path: ["REVALIDATE_SECRET"], message: "Refusing to start in production with a weak/default REVALIDATE_SECRET" });
      }
      if (!env.CORS_ORIGIN.startsWith("https://")) {
        ctx.addIssue({ code: "custom", path: ["CORS_ORIGIN"], message: "CORS_ORIGIN must be https:// in production" });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = parsed.data;
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";
