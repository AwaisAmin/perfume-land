import { notFound } from "next/navigation";
import CollectionHero from "@/components/collection/CollectionHero";
import CollectionView from "@/components/collection/CollectionView";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import { getSiteData } from "@/lib/site-data";

// Collections added in the CRM after the build render on first visit (then
// cached); unknown or deleted handles hit notFound() below.
export const dynamicParams = true;

export async function generateStaticParams() {
  const { collections } = await getSiteData();
  return collections.map((collection) => ({ handle: collection.handle }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const { collections } = await getSiteData();
  const collection = collections.find((c) => c.handle === handle);

  if (!collection) {
    notFound();
  }

  return (
    <>
      <CollectionHero title={collection.pageTitle ?? collection.title} image={collection.heroImage} />
      <CollectionView products={collection.products} />

      <ContactForm />
      <TrustBadges />
    </>
  );
}
