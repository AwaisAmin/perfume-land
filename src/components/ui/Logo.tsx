import Image from "next/image";
import clsx from "clsx";

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/haris-bhai-icon-256.png"
      alt="Haris Bhai Perfumes"
      width={256}
      height={256}
      className={clsx("h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20", className)}
      loading="eager"
      unoptimized
    />
  );
}
