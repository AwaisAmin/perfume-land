import MultiColumnSection from "@/components/shared/MultiColumnSection";
import { brandValues } from "@/data/brand";

export default function AboutValues() {
  return (
    <MultiColumnSection
      tone="forest"
      heading="About Us"
      intro={[
        "Hariss Bhai Perfumes is a perfume counter in Bahria Town, Lahore, where every bottle is blended, adjusted and filled by hand — and now shipped across Pakistan.",
      ]}
      items={brandValues}
    />
  );
}
