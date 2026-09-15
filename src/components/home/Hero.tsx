"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Volume2, VolumeX } from "lucide-react";
import Button from "@/components/ui/Button";

const HERO_VIDEO_SRC =
  "https://amanzadaperfumes.com/cdn/shop/videos/c/vp/1a0a6bc5dcc043d3870e3b5d572486d9/1a0a6bc5dcc043d3870e3b5d572486d9.HD-1080p-7.2Mbps-87559037.mp4?v=0";
const HERO_POSTER =
  "https://amanzadaperfumes.com/cdn/shop/files/preview_images/1a0a6bc5dcc043d3870e3b5d572486d9.thumbnail.0000000000_400x.jpg?v=1782569664";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

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
      {/* Poster is a plain CSS background so it always paints instantly,
          independent of whether the (large) video has buffered yet. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_POSTER})` }}
      />

      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
        src={HERO_VIDEO_SRC}
        poster={HERO_POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
      />
      <div className="absolute inset-0 bg-linear-to-t from-forest-950/80 via-forest-950/10 to-forest-950/30" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-w-2xl flex-col items-center gap-6 px-6 text-center"
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
