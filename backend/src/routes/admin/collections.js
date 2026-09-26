import { Router } from "express";
import { z } from "zod";
import {
  listCollectionsRaw,
  findCollectionById,
  findCollectionByHandle,
  countProductsInCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections,
  mapCollection,
} from "../../repositories/collectionsRepo.js";
import { validateBody } from "../../middleware/validate.js";
import { HttpError } from "../../middleware/errorHandler.js";
import { isValidHandle } from "../../utils/slug.js";
import { optionalImagePathSchema } from "../../utils/validators.js";
import { afterWrite } from "../../services/afterWrite.js";

const router = Router();

const handleField = z
  .string()
  .trim()
  .refine((v) => v === "" || isValidHandle(v), "Handle can only contain lowercase letters, numbers and dashes.")
  .optional();

// `id` (the public_id, e.g. "standard") is never accepted here: it is
// generated once on create and is immutable — the homepage and other
// site code key off it, so silently changing it would break the site.
const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  handle: handleField,
  kicker: z.string().trim().optional(),
  pageTitle: z.string().trim().optional(),
  heroImage: optionalImagePathSchema,
});

const updateSchema = createSchema.partial().extend({
  title: z.string().trim().min(1).optional(),
});

const reorderSchema = z.object({ orderedIds: z.array(z.number().int().positive()).min(1) });

async function assertHandleFree(handle, excludeId) {
  if (!handle) return;
  const existing = await findCollectionByHandle(handle);
  if (existing && existing.id !== excludeId) {
    throw new HttpError(409, `Handle "${handle}" is already used by another collection.`);
  }
}

router.get("/", async (req, res) => {
  const rows = await listCollectionsRaw();
  const withCounts = await Promise.all(
    rows.map(async (row) => ({ ...mapCollection(row), dbId: row.id, productCount: await countProductsInCollection(row.id) }))
  );
  res.json({ collections: withCounts });
});

router.get("/:id", async (req, res) => {
  const row = await findCollectionById(req.params.id);
  if (!row) throw new HttpError(404, "Collection not found.");
  res.json({ collection: { ...mapCollection(row), dbId: row.id } });
});

router.post("/", validateBody(createSchema), async (req, res) => {
  await assertHandleFree(req.body.handle);
  const row = await createCollection(req.body);
  await afterWrite();
  res.status(201).json({ collection: { ...mapCollection(row), dbId: row.id } });
});

router.put("/:id", validateBody(updateSchema), async (req, res) => {
  const existing = await findCollectionById(req.params.id);
  if (!existing) throw new HttpError(404, "Collection not found.");
  if (req.body.handle) await assertHandleFree(req.body.handle, existing.id);
  const row = await updateCollection(req.params.id, req.body);
  await afterWrite();
  res.json({ collection: { ...mapCollection(row), dbId: row.id } });
});

router.delete("/:id", async (req, res) => {
  const existing = await findCollectionById(req.params.id);
  if (!existing) throw new HttpError(404, "Collection not found.");
  const count = await countProductsInCollection(existing.id);
  if (count > 0) {
    throw new HttpError(409, `Cannot delete "${existing.title}" — it still has ${count} product(s). Move or delete them first.`);
  }
  await deleteCollection(existing.id);
  await afterWrite();
  res.json({ ok: true });
});

router.post("/reorder", validateBody(reorderSchema), async (req, res) => {
  await reorderCollections(req.body.orderedIds);
  await afterWrite();
  res.json({ ok: true });
});

export default router;
