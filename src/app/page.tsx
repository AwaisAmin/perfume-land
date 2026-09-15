import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import MediaGrid from "@/components/home/MediaGrid";
import BeforeAfter from "@/components/home/BeforeAfter";
import FeaturedProduct from "@/components/home/FeaturedProduct";
import AboutValues from "@/components/home/AboutValues";
import Newsletter from "@/components/home/Newsletter";
import { collections, featuredProduct } from "@/data/products";

export default function Home() {
  const [signature, standard, oil, interior] = collections;

  return (
    <>
      <Hero />
      <FeaturedCollection collection={standard} />
      <Marquee text="Luxury Scents" tone="gold" direction="left" />
      <Marquee text="Honest Prices" tone="forest" direction="right" />
      <FeaturedCollection collection={signature} />
      <MediaGrid />
      <FeaturedCollection collection={oil} />
      <BeforeAfter />
      <FeaturedProduct product={featuredProduct} />
      <FeaturedCollection collection={interior} />
      <AboutValues />
      <Newsletter />
    </>
  );
}
