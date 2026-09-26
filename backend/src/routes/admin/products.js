import { Router } from "express";
import { z } from "zod";
import {
  listProductsAdmin,
  findProductById,
  findProductByHandle,
  createProduct,
  updateProductWithVariants,
  deleteProduct,
  reorderProducts,
  mapProduct,
} from "../../repositories/productsRepo.js";
import {
  listVariantsForProduct,
  summarizeVariants,
  replaceVariantsForProduct,
} from "../../repositories/productVariantsRepo.js";
import { findCollectionById } from "../../repositories/collectionsRepo.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { HttpError } from "../../middleware/errorHandler.js";
import { isValidHandle } from "../../utils/slug.js";
import { nullableImagePathSchema } from "../../utils/validators.js";
import { variantsArraySchema } from "../../utils/variantSchema.js";
import { afterWrite } from "../../services/afterWrite.js";

const router = Router();

const handleField = z
  .string()
  .trim()
  .refine((v) => v === "" || isValidHandle(v), "Handle can only contain lowercase letters, numbers and dashes.")
  .optional();

// price/compareAtPrice/size/inStock are NOT accepted here — they live on
// variants now (see variantsArraySchema) and are derived onto the product.
// kicker/image/gender/description/stockCount are nullable so the CRM can
// explicitly clear them on update (an absent key leaves the field alone; an
// explicit null/"" clears it).
const baseSchema = {
  collectionId: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, "Title is required."),
  handle: handleField,
  kicker: z.string().trim().nullable().optional(),
  image: nullableImagePathSchema,
  gender: z.enum(["unisex", "women", "men"]).nullable().optional(),
  description: z.string().trim().nullable().optional(),
  stockCount: z.coerce.number().int().nonnegative().nullable().optional(),
};

// A brand-new product must arrive with at least one variant.
const createSchema = z.object({ ...baseSchema, variants: variantsArraySchema });
// An update may optionally include a new variants array — product fields and
// variants are then saved together in one transaction/one request.
const updateSchema = z.object(baseSchema).partial().extend({ variants: variantsArraySchema.optional() });
const variantsUpdateSchema = z.object({ variants: variantsArraySchema });

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  collectionId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(200).optional().default(50),
});

const reorderSchema = z.object({
  collectionId: z.coerce.number().int().positive(),
  orderedIds: z.array(z.number().int().positive()).min(1),
});

async function assertHandleFree(handle, excludeId) {
  if (!handle) return;
  const existing = await findProductByHandle(handle, excludeId);
  if (existing) {
    throw new HttpError(409, `Handle "${handle}" is already used by another product.`);
  }
}

async function assertCollectionExists(collectionId) {
  if (collectionId === undefined) return;
  const collection = await findCollectionById(collectionId);
  if (!collection) throw new HttpError(400, "That collection does not exist.");
}

router.get("/", validateQuery(listQuerySchema), async (req, res) => {
  const { search, collectionId, page, pageSize } = req.validatedQuery;
  const { rows, total } = await listProductsAdmin({ search, collectionId, page, pageSize });
  const summaries = await summarizeVariants(rows.map((row) => row.id));

  res.json({
    products: rows.map((row) => {
      const summary = summaries.get(row.id);
      return {
        id: row.public_id,
        dbId: row.id,
        handle: row.handle,
        title: row.title,
        image: row.image || undefined,
        collectionId: row.collection_id,
        collectionTitle: row.collection_title,
        collectionHandle: row.collection_handle,
        variantCount: summary?.variantCount ?? 0,
        minPrice: summary?.minPrice ?? row.price,
        maxPrice: summary?.maxPrice ?? row.price,
        inStock: Boolean(row.in_stock),
      };
    }),
    total,
    page,
    pageSize,
  });
});

router.get("/:id", async (req, res) => {
  const row = await findProductById(req.params.id);
  if (!row) throw new HttpError(404, "Product not found.");
  const variants = await listVariantsForProduct(row.id);
  res.json({ product: { ...mapProduct(row, variants), dbId: row.id, collectionId: row.collection_id } });
});

router.post("/", validateBody(createSchema), async (req, res) => {
  await assertCollectionExists(req.body.collectionId);
  await assertHandleFree(req.body.handle);
  const row = await createProduct(req.body);
  const variants = await listVariantsForProduct(row.id);
  await afterWrite();
  res.status(201).json({ product: { ...mapProduct(row, variants), dbId: row.id, collectionId: row.collection_id } });
});

// Saves the product's own fields and (if included) its variants together, in
// one transaction — the modal only makes one request, and the response is
// always the true final state (never a partially-applied result).
router.put("/:id", validateBody(updateSchema), async (req, res) => {
  const existing = await findProductById(req.params.id);
  if (!existing) throw new HttpError(404, "Product not found.");
  await assertCollectionExists(req.body.collectionId);
  if (req.body.handle) await assertHandleFree(req.body.handle, existing.id);
  const { variants, ...productFields } = req.body;
  await updateProductWithVariants(existing.id, productFields, variants);
  const row = await findProductById(existing.id);
  const freshVariants = await listVariantsForProduct(existing.id);
  await afterWrite();
  res.json({ product: { ...mapProduct(row, freshVariants), dbId: row.id, collectionId: row.collection_id } });
});

// Kept as a standalone endpoint for editing just the variants list without
// touching the rest of the product (also used directly by tests).
router.put("/:id/variants", validateBody(variantsUpdateSchema), async (req, res) => {
  const existing = await findProductById(req.params.id);
  if (!existing) throw new HttpError(404, "Product not found.");
  await replaceVariantsForProduct(existing.id, existing.public_id, req.body.variants);
  const row = await findProductById(existing.id);
  const variants = await listVariantsForProduct(existing.id);
  await afterWrite();
  res.json({ product: { ...mapProduct(row, variants), dbId: row.id, collectionId: row.collection_id } });
});

router.delete("/:id", async (req, res) => {
  const existing = await findProductById(req.params.id);
  if (!existing) throw new HttpError(404, "Product not found.");
  await deleteProduct(existing.id);
  await afterWrite();
  res.json({ ok: true });
});

router.post("/reorder", validateBody(reorderSchema), async (req, res) => {
  await reorderProducts(req.body.collectionId, req.body.orderedIds);
  await afterWrite();
  res.json({ ok: true });
});

export default router;
