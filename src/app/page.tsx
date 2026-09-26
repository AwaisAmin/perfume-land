import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import MediaGrid from "@/components/home/MediaGrid";
import ShopTheLook from "@/components/home/ShopTheLook";
import BeforeAfter from "@/components/home/BeforeAfter";
import FeaturedProduct from "@/components/home/FeaturedProduct";
import AboutValues from "@/components/home/AboutValues";
import Newsletter from "@/components/home/Newsletter";
import ContactForm from "@/components/shared/ContactForm";
import TrustBadges from "@/components/shared/TrustBadges";
import { getSiteData } from "@/lib/site-data";
import type { Collection } from "@/lib/types";

export default async function Home() {
  const { collections, featuredProduct, shopTheLookGroups, beforeAfterImages, content } = await getSiteData();
  const home = content.home;
  // The catalog product behind "Product of the Week", and which of its real
  // variants each displayed option is (null = not purchasable right now).
  const featuredSource = collections.flatMap((c) => c.products).find((p) => p.handle === featuredProduct.handle);
  const featuredVariantIds = featuredProduct.variants.map(
    (option) =>
      featuredSource?.variants.find((v) => v.size === option.size || `${v.type} ${v.size}` === option.size)?.id ?? null,
  );
  // A collection removed in the CRM simply drops its homepage row.
  const getCollection = (id: Collection["id"]) => {
    const collection = collections.find((c) => c.id === id);
    if (!collection) console.warn(`[home] Collection "${id}" is missing from the site data; skipping its row.`);
    return collection;
  };
  const standard = getCollection("standard");
  const premium = getCollection("premium");
  const signature = getCollection("signature");
  const oil = getCollection("oil");
  const interior = getCollection("interior");

  return (
    <>
      <Hero {...home.hero} />
      {standard && <FeaturedCollection collection={standard} viewAllLabel={home.viewAllLabel} />}
      {premium && <FeaturedCollection collection={premium} viewAllLabel={home.viewAllLabel} />}
      <Marquee text={home.marqueeGold} tone="gold" direction="left" />
      <Marquee text={home.marqueeForest} tone="forest" direction="right" />
      {signature && <FeaturedCollection collection={signature} viewAllLabel={home.viewAllLabel} />}
      <MediaGrid {...home.mediaGrid} />
      {oil && <FeaturedCollection collection={oil} viewAllLabel={home.viewAllLabel} />}
      {shopTheLookGroups[0] && shopTheLookGroups[0].items.length > 0 && <ShopTheLook group={shopTheLookGroups[0]} texts={home.shopTheLook} />}
      {interior && <FeaturedCollection collection={interior} viewAllLabel={home.viewAllLabel} />}
      <BeforeAfter images={beforeAfterImages} texts={home.beforeAfter} />
      <FeaturedProduct product={featuredProduct} texts={home.featuredProduct} source={featuredSource} variantIds={featuredVariantIds} />
      <AboutValues />
      <Newsletter texts={home.newsletter} />
      <ContactForm />
      <TrustBadges />
    </>
  );
}
