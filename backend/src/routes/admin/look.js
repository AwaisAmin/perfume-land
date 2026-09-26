import { Router } from "express";
import { z } from "zod";
import {
  listLookGroupsAdmin,
  findLookGroupById,
  createLookGroup,
  updateLookGroup,
  deleteLookGroup,
  reorderLookGroups,
  createLookItem,
  findLookItemById,
  updateLookItem,
  deleteLookItem,
  reorderLookItems,
} from "../../repositories/lookRepo.js";
import { validateBody } from "../../middleware/validate.js";
import { HttpError } from "../../middleware/errorHandler.js";
import { afterWrite } from "../../services/afterWrite.js";
import { optionalImagePathSchema } from "../../utils/validators.js";

const router = Router();

const groupSchema = z.object({
  handle: z.string().trim().optional(),
  image: optionalImagePathSchema,
});

const itemSchema = z.object({
  handle: z.string().trim().min(1),
  title: z.string().trim().min(1),
  price: z.coerce.number().int().nonnegative(),
  image: optionalImagePathSchema,
  top: z.coerce.number().min(0).max(100),
  left: z.coerce.number().min(0).max(100),
});

const reorderGroupsSchema = z.object({ orderedIds: z.array(z.number().int().positive()).min(1) });
const reorderItemsSchema = z.object({ groupId: z.number().int().positive(), orderedIds: z.array(z.number().int().positive()).min(1) });

router.get("/", async (req, res) => {
  res.json({ groups: await listLookGroupsAdmin() });
});

router.post("/", validateBody(groupSchema), async (req, res) => {
  const group = await createLookGroup(req.body);
  await afterWrite();
  res.status(201).json({ group });
});

router.put("/:id", validateBody(groupSchema), async (req, res) => {
  const existing = await findLookGroupById(req.params.id);
  if (!existing) throw new HttpError(404, "Look group not found.");
  const group = await updateLookGroup(req.params.id, req.body);
  await afterWrite();
  res.json({ group });
});

router.delete("/:id", async (req, res) => {
  const existing = await findLookGroupById(req.params.id);
  if (!existing) throw new HttpError(404, "Look group not found.");
  await deleteLookGroup(existing.id);
  await afterWrite();
  res.json({ ok: true });
});

router.post("/reorder", validateBody(reorderGroupsSchema), async (req, res) => {
  await reorderLookGroups(req.body.orderedIds);
  await afterWrite();
  res.json({ ok: true });
});

router.post("/:id/items", validateBody(itemSchema), async (req, res) => {
  const group = await findLookGroupById(req.params.id);
  if (!group) throw new HttpError(404, "Look group not found.");
  const item = await createLookItem(group.id, req.body);
  await afterWrite();
  res.status(201).json({ item });
});

router.put("/items/:itemId", validateBody(itemSchema.partial()), async (req, res) => {
  const existing = await findLookItemById(req.params.itemId);
  if (!existing) throw new HttpError(404, "Look item not found.");
  const item = await updateLookItem(req.params.itemId, req.body);
  await afterWrite();
  res.json({ item });
});

router.delete("/items/:itemId", async (req, res) => {
  const existing = await findLookItemById(req.params.itemId);
  if (!existing) throw new HttpError(404, "Look item not found.");
  await deleteLookItem(existing.id);
  await afterWrite();
  res.json({ ok: true });
});

router.post("/items/reorder", validateBody(reorderItemsSchema), async (req, res) => {
  await reorderLookItems(req.body.groupId, req.body.orderedIds);
  await afterWrite();
  res.json({ ok: true });
});

export default router;
