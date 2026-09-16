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
import { collections, featuredProduct } from "@/data/products";
import type { Collection } from "@/lib/types";

function getCollection(id: Collection["id"]) {
  const collection = collections.find((c) => c.id === id);
  if (!collection) throw new Error(`Missing collection: ${id}`);
  return collection;
}

export default function Home() {
  const standard = getCollection("standard");
  const signature = getCollection("signature");
  const oil = getCollection("oil");
  const interior = getCollection("interior");

  return (
    <>
      <Hero />
      <FeaturedCollection collection={standard} />
      <Marquee text="Luxury Scents" tone="gold" direction="left" />
      <Marquee text="Honest Prices" tone="forest" direction="right" />
      <FeaturedCollection collection={signature} />
      <MediaGrid />
      <FeaturedCollection collection={oil} />
      <ShopTheLook />
      <FeaturedCollection collection={interior} />
      <BeforeAfter />
      <FeaturedProduct product={featuredProduct} />
      <AboutValues />
      <Newsletter />
      <ContactForm />
      <TrustBadges />
    </>
  );
}
