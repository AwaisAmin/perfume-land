import Image from "next/image";
import { bottleImage } from "@/data/products";

/** Branded photography fallback for decorative bottle placements. */
export default function ProductBottle({ className }: { className?: string }) {
  return <Image src={bottleImage} width={676} height={1200} alt="" className={className} style={{ objectFit: "contain" }} />;
}
