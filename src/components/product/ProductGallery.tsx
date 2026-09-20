import ProductImage from "@/components/ui/ProductImage";
import type { Product } from "@/lib/types";

/**
 * The product detail page's main photo. A plain, page-agnostic wrapper
 * around the shared `ProductImage` fallback logic — kept separate from
 * `ProductInfo` so a future multi-photo gallery only touches this file.
 */
export default function ProductGallery({ product }: { product: Product }) {
  return (
    <div className="relative aspect-4/5 bg-cream-100">
      <ProductImage product={product} bottleClassName="h-2/3 w-auto" imageClassName="object-contain p-6 sm:p-10" priority />
    </div>
  );
}
