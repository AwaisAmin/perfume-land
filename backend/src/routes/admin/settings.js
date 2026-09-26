import { Router } from "express";
import { z } from "zod";
import { getAllSettings, getSetting, setSetting } from "../../repositories/settingsRepo.js";
import { HttpError } from "../../middleware/errorHandler.js";
import { afterWrite } from "../../services/afterWrite.js";
import { imagePathSchema, siteHrefSchema, mapUrlSchema, phoneSchema } from "../../utils/validators.js";
import { contentSchema } from "../../utils/contentSchema.js";

const router = Router();

const linkSchema = z.object({ label: z.string().trim().min(1), href: siteHrefSchema });
const navGroupSchema = z.object({ title: z.string().trim().min(1), links: z.array(linkSchema) });

const SETTINGS_SCHEMAS = {
  bottleImage: imagePathSchema,
  beforeAfterImages: z.object({ him: imagePathSchema, her: imagePathSchema }),
  brand: z.object({
    journeyImage: imagePathSchema,
    brandValues: z.array(z.object({ title: z.string().trim().min(1), body: z.string().trim().min(1) })),
    brandCraft: z.array(z.object({ title: z.string().trim().min(1), body: z.string().trim().min(1) })),
  }),
  contact: z.object({
    whatsappNumber: phoneSchema,
    orderWhatsappNumber: phoneSchema,
    branches: z.array(
      z.object({
        name: z.string().trim().min(1),
        address: z.string().trim().min(1),
        mapUrl: mapUrlSchema.optional(),
      })
    ),
  }),
  nav: z.object({
    brandImpressionsGroups: z.array(navGroupSchema),
    primaryNavStart: z.array(linkSchema),
    primaryNavEnd: z.array(linkSchema),
  }),
  announcements: z.array(z.string().trim().min(1)),
  freeShippingThreshold: z.coerce.number().int().nonnegative(),
  content: contentSchema,
};

router.get("/", async (req, res) => {
  const settings = await getAllSettings();
  delete settings.updatedAt;
  res.json({ settings });
});

router.get("/:key", async (req, res) => {
  const { key } = req.params;
  if (!SETTINGS_SCHEMAS[key]) throw new HttpError(404, "Unknown settings key.");
  const value = await getSetting(key);
  res.json({ key, value: value ?? null });
});

router.put("/:key", async (req, res) => {
  const { key } = req.params;
  const schema = SETTINGS_SCHEMAS[key];
  if (!schema) throw new HttpError(404, "Unknown settings key.");

  const result = schema.safeParse(req.body?.value ?? req.body);
  if (!result.success) {
    throw new HttpError(400, "Invalid settings data.", result.error.flatten());
  }

  await setSetting(key, result.data);
  await afterWrite();
  res.json({ key, value: result.data });
});

export default router;
