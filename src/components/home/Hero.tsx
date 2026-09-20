"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, Volume2, VolumeX } from "lucide-react";
import Button from "@/components/ui/Button";

const HERO_VIDEO_SRC = "/videos/haris-bhai-perfume-making.mp4";
const HERO_POSTER = "/videos/haris-bhai-perfume-making-poster.webp";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  // The film is by far the heaviest asset on the site. The poster already
  // fills the hero, so the video is only fetched once the page has finished
  // loading everything else — that keeps it off the critical path and out of
  // the running for LCP, instead of holding up the first paint.
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Respect an explicit request for less motion or less data, and don't
    // spend a phone's data budget on a decorative loop over a slow link.
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      connection?.saveData ||
      (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType))
    ) {
      return;
    }

    // The film is 11MB. On a phone that is somebody's data plan spent on a
    // decorative loop, and it would take over as the largest paint long
    // after the poster has already filled the hero — so phones keep the
    // poster and only wider screens load the film.
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const start = () => setVideoSrc(HERO_VIDEO_SRC);
    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  const scrollToNext = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  return (
    <section
      className="relative flex w-full items-center justify-center bg-forest-950"
      style={{
        height: "calc(100vh - var(--announcement-height, 40px))",
        marginTop: "calc(-1 * var(--header-height, 132px))",
      }}
    >
      {/* The poster carries the hero on its own until the film arrives, so
          it is this page's largest paint and is loaded first. Going through
          next/image (rather than a CSS background) means a phone is served a
          phone-sized frame instead of the full 1920px one. */}
      <Image
        src={HERO_POSTER}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-[72%_center] sm:object-center"
      />

      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover object-[72%_center] sm:object-center transition-opacity duration-700 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
        src={videoSrc}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="none"
        onCanPlay={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
      />
      <div className="absolute inset-0 bg-linear-to-t from-forest-950/80 via-forest-950/10 to-forest-950/30" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-20 z-10 flex max-w-2xl flex-col items-center gap-6 px-6 text-center"
      >
        <Button href="/collections" variant="solid">
          Discover the Collection
        </Button>
      </motion.div>

      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-8 left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/40 text-cream-50 transition hover:bg-cream-50/10 sm:left-10"
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      <button
        type="button"
        onClick={scrollToNext}
        aria-label="Scroll to next section"
        className="group absolute bottom-0 left-1/2 z-10 flex h-12.5 w-12.5 -translate-x-1/2 translate-y-1/2 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-cream-50 text-ink shadow-[0_0.125rem_0.625rem_rgba(28,28,26,0.15)]"
      >
        <ChevronDown size={16} className="group-hover:animate-icon-block" />
      </button>
    </section>
  );
}
