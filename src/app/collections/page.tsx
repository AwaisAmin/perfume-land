import CollectionsGrid from "@/components/collection/CollectionsGrid";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import { getSiteData } from "@/lib/site-data";

// The live site's "/collections" index isn't every collection in the
// store — it's a hand-picked set of four (Exclusive, Standard, Premium,
// Signature), in this exact order, confirmed by inspecting the live page.
const FEATURED_HANDLES = [
  "exclusive-collection",
  "standard-collection",
  "premium-collection",
  "signature-collection",
];

export default async function CollectionsIndexPage() {
  const { collections, content } = await getSiteData();
  const featured = FEATURED_HANDLES.map((handle) =>
    collections.find((c) => c.handle === handle),
  ).filter((c) => c !== undefined);

  return (
    <>
      <CollectionsGrid collections={featured} labels={content.collections} />

      <ContactForm />
      <TrustBadges />
    </>
  );
}
