"use client";

import Image from "next/image";
import { useSiteData } from "@/lib/site-data-context";

/** Branded photography fallback for decorative bottle placements. */
export default function PerfumeBottle({ className }: { className?: string }) {
  const { bottleImage } = useSiteData();
  return <Image src={bottleImage} width={676} height={1200} alt="" className={className} style={{ objectFit: "contain" }} />;
}
