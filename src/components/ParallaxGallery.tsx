"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const defaultImages = [
  "/images/parallax_courtyard.jpg",
  "/images/parallax_study.jpg",
  "/images/parallax_dining.jpg",
  "/images/parallax_lounge.jpg",
  "/images/parallax_verandah.jpg",
  "/images/parallax_kitchen.jpg",
  "/images/parallax_staircase.jpg",
  "/images/parallax_bathroom.jpg",
  "/images/parallax_door.jpg",
  "/images/parallax_screen.jpg",
  "/images/parallax_facade.jpg",
  "/images/parallax_details.jpg",
];

interface ParallaxGalleryProps {
  customImages?: string[];
}

export default function ParallaxGallery({ customImages }: ParallaxGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);

  const images = (customImages && customImages.length >= 12) ? customImages : defaultImages;

  // Track scroll position of section
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"],
  });

  // Multi-speed vertical transforms GPU-accelerated for smooth scrolling
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);   // Stream 1: Upward
  const y2 = useTransform(scrollYProgress, [0, 1], ["-25%", "10%"]);  // Stream 2: Downward
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);   // Stream 3: Upward
  const y4 = useTransform(scrollYProgress, [0, 1], ["-20%", "12%"]);  // Stream 4: Downward

  return (
    <section
      ref={galleryRef}
      className="relative box-border flex h-[80vh] md:h-[100vh] overflow-hidden bg-[#FAF8F5] p-3 md:p-6 border-t border-b border-charcoal/10 z-20 select-none"
    >
      {/* 4-Column Parallax Grid Container */}
      <div className="relative flex-grow flex gap-3 md:gap-5 overflow-hidden">
        <Column images={[images[0], images[1], images[2]]} y={y1} initialTop="-top-[5%]" />
        <Column images={[images[3], images[4], images[5]]} y={y2} initialTop="-top-[30%]" />
        <Column images={[images[6], images[7], images[8]]} y={y3} initialTop="-top-[10%]" />
        <Column images={[images[9], images[10], images[11]]} y={y4} initialTop="-top-[25%]" />
      </div>
    </section>
  );
}

interface ColumnProps {
  images: string[];
  y: MotionValue<string>;
  initialTop: string;
}

const Column = ({ images, y, initialTop }: ColumnProps) => {
  return (
    <motion.div
      className={`relative ${initialTop} flex h-[145%] w-1/4 min-w-[130px] md:min-w-[200px] flex-col gap-3 md:gap-4 will-change-transform`}
      style={{ y }}
    >
      {images.map((src, i) => (
        <div 
          key={i} 
          className="relative h-[31%] w-full overflow-hidden rounded border border-charcoal/10 shadow-md group bg-charcoal/5"
        >
          <Image
            src={src}
            alt="Kerala architectural detail study"
            fill
            sizes="(max-width: 768px) 45vw, (max-width: 1200px) 25vw, 20vw"
            className="pointer-events-none object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={i === 0}
          />
        </div>
      ))}
    </motion.div>
  );
};
