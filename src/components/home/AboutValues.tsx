import MultiColumnSection from "@/components/shared/MultiColumnSection";
import { brandValues } from "@/data/brand";

export default function AboutValues() {
  return (
    <MultiColumnSection
      tone="forest"
      heading="About Us"
      intro={[
        "Haris Bhai Perfumes crafts timeless fragrances with finest ingredients, blending tradition and modern artistry into every scent.",
      ]}
      items={brandValues}
    />
  );
}
