import MultiColumnSection from "@/components/shared/MultiColumnSection";
import { getSiteData } from "@/lib/site-data";

export default async function AboutValues() {
  const { brand, content } = await getSiteData();
  const { brandValues } = brand;
  const { heading, intro } = content.home.aboutValues;
  return (
    <MultiColumnSection
      tone="forest"
      heading={heading}
      intro={intro}
      items={brandValues}
    />
  );
}
