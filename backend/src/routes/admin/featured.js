import { Router } from "express";
import { z } from "zod";
import { getFeaturedProduct, mapFeatured, updateFeaturedProduct, replaceFeaturedVariants } from "../../repositories/featuredRepo.js";
import { validateBody } from "../../middleware/validate.js";
import { afterWrite } from "../../services/afterWrite.js";
import { optionalImagePathSchema } from "../../utils/validators.js";

const router = Router();

const productSchema = z.object({
  handle: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: optionalImagePathSchema,
});

const variantsSchema = z.object({
  variants: z
    .array(
      z.object({
        size: z.string().trim().min(1),
        price: z.coerce.number().int().nonnegative(),
        compareAtPrice: z.coerce.number().int().nonnegative().optional().nullable(),
      })
    )
    .min(1),
});

router.get("/", async (req, res) => {
  const { product, variants } = await getFeaturedProduct();
  res.json({ featuredProduct: product ? mapFeatured(product, variants) : null });
});

router.put("/", validateBody(productSchema), async (req, res) => {
  await updateFeaturedProduct(req.body);
  await afterWrite();
  const { product, variants } = await getFeaturedProduct();
  res.json({ featuredProduct: mapFeatured(product, variants) });
});

router.put("/variants", validateBody(variantsSchema), async (req, res) => {
  await replaceFeaturedVariants(req.body.variants);
  await afterWrite();
  const { product, variants } = await getFeaturedProduct();
  res.json({ featuredProduct: mapFeatured(product, variants) });
});

export default router;
