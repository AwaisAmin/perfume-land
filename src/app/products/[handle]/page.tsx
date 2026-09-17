import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import { collections } from "@/data/products";

export function generateStaticParams() {
  return collections.flatMap((collection) => collection.products.map((p) => ({ handle: p.handle })));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const collection = collections.find((c) => c.products.some((p) => p.handle === handle));
  const product = collection?.products.find((p) => p.handle === handle);

  if (!product || !collection) {
    notFound();
  }

  // "Related products" on the live site mixes same-collection items with
  // cross-category matches from its recommendation engine — not something
  // static mock data can reproduce, so this uses the closest honest
  // equivalent: other products from the same collection.
  const relatedProducts = collection.products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      <div className="container-app mx-auto max-w-339 pt-12 pb-26">
        {/* image:info is a 0.65/0.35 split with the info column sticking
            under the header while the (taller) image scrolls past it —
            matches the live site's own product layout exactly (confirmed
            via measurement: position:sticky, top:20px, 767px/413px
            columns, 80px gap). */}
        <div className="grid items-start gap-10 md:grid-cols-[0.65fr_0.35fr] md:gap-20">
          <ProductGallery product={product} />
          <div className="md:sticky md:top-5">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      <RelatedProducts products={relatedProducts} />

      <ContactForm />
      <TrustBadges />
    </>
  );
}
