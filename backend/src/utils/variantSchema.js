import { z } from "zod";

export const VARIANT_TYPES = ["EDT", "EDP", "Perfume"];
export const VARIANT_SIZES = ["35ml", "50ml", "100ml"];

// "" / undefined / null all mean "not filled in" — turn them into
// `undefined` so the required-number check below reports a clear "required"
// error instead of silently coercing an empty field to 0.
const emptyToUndefined = (v) => (v === "" || v === null || v === undefined ? undefined : v);

const requiredPriceField = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ required_error: "Price is required.", invalid_type_error: "Price must be a number." }).int("Price must be a whole number.").positive("Price must be greater than 0.")
);

const optionalPriceField = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int("Price must be a whole number.").positive("Price must be greater than 0.").optional()
);

// One variant row. `id` (the stable public id, e.g. "product-3-v2") is only
// present when editing an existing variant — new rows from the CRM omit it.
export const variantInputSchema = z
  .object({
    id: z.string().trim().optional(),
    type: z.enum(VARIANT_TYPES).nullable().optional().default(null),
    size: z.enum(VARIANT_SIZES, { errorMap: () => ({ message: `Size must be one of ${VARIANT_SIZES.join(", ")}.` }) }),
    price: requiredPriceField,
    compareAtPrice: optionalPriceField.nullable(),
    inStock: z.boolean().optional().default(true),
  })
  .superRefine((variant, ctx) => {
    if (variant.size === "35ml" && variant.type) {
      ctx.addIssue({ code: "custom", path: ["type"], message: "35ml variants cannot have a type (EDT/EDP/Perfume)." });
    }
    if (variant.size !== "35ml" && !variant.type) {
      ctx.addIssue({ code: "custom", path: ["type"], message: "Type is required for 50ml and 100ml variants." });
    }
    if (variant.compareAtPrice != null && variant.compareAtPrice <= variant.price) {
      ctx.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "Compare-at price must be greater than the price (it's shown as a crossed-out 'was' price).",
      });
    }
  });

// The full list of variants for one product: at least one, and no two
// variants may share the same type+size combination.
export const variantsArraySchema = z
  .array(variantInputSchema)
  .min(1, "A product needs at least one variant.")
  .superRefine((variants, ctx) => {
    const seen = new Set();
    variants.forEach((variant, index) => {
      const key = `${variant.type ?? "null"}:${variant.size}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: [index],
          message: `Duplicate variant: ${variant.type ? `${variant.type} ` : ""}${variant.size} is already used by another row.`,
        });
      }
      seen.add(key);
    });
  });
