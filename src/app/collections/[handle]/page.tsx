import { notFound } from "next/navigation";
import CollectionHero from "@/components/collection/CollectionHero";
import CollectionView from "@/components/collection/CollectionView";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import Newsletter from "@/components/home/Newsletter";
import { collections } from "@/data/products";

export function generateStaticParams() {
  return collections.map((collection) => ({ handle: collection.handle }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = collections.find((c) => c.handle === handle);

  if (!collection) {
    notFound();
  }

  return (
    <>
      <CollectionHero title={collection.pageTitle ?? collection.title} image={collection.heroImage} />
      <CollectionView products={collection.products} />

      <Newsletter />
      <ContactForm />
      <TrustBadges />
    </>
  );
}
