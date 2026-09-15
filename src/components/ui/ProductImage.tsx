import Image from "next/image";
import ProductBottle from "@/components/ui/ProductBottle";
import type { Product } from "@/lib/types";

type ProductImageProps = {
  product: Pick<Product, "title" | "image">;
  /** Sizing classes for the illustrated bottle (ignored once a real photo is set). */
  bottleClassName?: string;
  /** Overrides the real photo's classes — e.g. to drop the grid cards' matting/padding for a plain full-bleed hero shot. */
  imageClassName?: string;
  priority?: boolean;
};

/**
 * Renders a product's real photo when `product.image` is set, otherwise
 * falls back to the illustrated placeholder bottle. Swapping in real
 * photography later is just a matter of adding an `image` path to the
 * product data — no component changes needed.
 */
export default function ProductImage({
  product,
  bottleClassName,
  imageClassName = "object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-105",
  priority,
}: ProductImageProps) {
  if (product.image) {
    return (
      <Image
        src={product.image}
        alt={product.title}
        fill
        priority={priority}
        sizes="(max-width: 699px) 74vw, (max-width: 999px) 38vw, 25vw"
        className={imageClassName}
      />
    );
  }

  return <ProductBottle className={bottleClassName} />;
}
