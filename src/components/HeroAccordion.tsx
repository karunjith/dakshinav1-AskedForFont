"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AccordionImage {
  src: string;
  alt: string;
  code?: string;
  title?: string;
}

const defaultImages: AccordionImage[] = [
  {
    src: "/images/hero_carousel_1.jpg",
    alt: "The Backwater Courtyard Villa • Tropical Architecture",
    code: "ARCH-01",
    title: "The Backwater Courtyard Villa",
  },
  {
    src: "/images/hero_carousel_2.jpg",
    alt: "Kuttanad Heritage Modern Dining • Spatial Curation",
    code: "INT-02",
    title: "Kuttanad Heritage Dining",
  },
  {
    src: "/images/hero_carousel_3.jpg",
    alt: "Vazhicherry Coastal Residence • Climate Passive Build",
    code: "PLN-03",
    title: "Vazhicherry Coastal Residence",
  },
  {
    src: "/images/hero_carousel_4.jpg",
    alt: "Alleppey Courtyard Living • Teak Joinery",
    code: "LND-04",
    title: "Alleppey Courtyard Living",
  },
  {
    src: "/images/hero_carousel_5.jpg",
    alt: "Malayalam Heritage Sanctuary • Sustainable Restoration",
    code: "RST-05",
    title: "Malayalam Heritage Sanctuary",
  },
];

interface HeroAccordionProps {
  customImages?: AccordionImage[] | string[];
  className?: string;
}

export function HeroAccordion({ customImages, className }: HeroAccordionProps) {
  // Always guarantee exactly 5 slots with rock-solid fallback to default demo images
  const imagesToUse: AccordionImage[] = [0, 1, 2, 3, 4].map((idx) => {
    const fallback = defaultImages[idx];
    if (!customImages || !Array.isArray(customImages)) {
      return fallback;
    }
    const item = customImages[idx];
    if (typeof item === "string" && item.trim()) {
      return {
        src: item.trim(),
        alt: `Dakshina Portfolio Showcase ${idx + 1}`,
        code: fallback.code || `#0${idx + 1}`,
        title: fallback.title || `Design Project 0${idx + 1}`,
      };
    } else if (item && typeof item === "object" && typeof item.src === "string" && item.src.trim()) {
      return item;
    }
    return fallback;
  });

  return (
    <div className={cn("flex w-full items-center justify-center overflow-hidden py-2", className)}>
      <HoverExpand_002 images={imagesToUse} />
    </div>
  );
}

const HoverExpand_002 = ({
  images,
  className,
}: {
  images: AccordionImage[];
  className?: string;
}) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  React.useEffect(() => {
    const check = () => setIsMobileScreen(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 1, 0.5, 1],
      }}
      className={cn("relative w-full max-w-xl px-2 sm:px-4", className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <div className="flex w-full flex-col items-center justify-center gap-2 sm:gap-2.5 touch-pan-y">
          {images.map((image, index) => {
            const isActive = activeImage === index;

            return (
              <motion.div
                key={index}
                className="group relative w-full cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl border border-[#8C421F]/20 shadow-lg touch-pan-y"
                initial={false}
                animate={{
                  height: isActive ? (isMobileScreen ? "15rem" : "20rem") : (isMobileScreen ? "2.6rem" : "3.2rem"),
                }}
                transition={{ 
                  duration: 0.75, 
                  ease: [0.25, 1, 0.5, 1] 
                }}
                onClick={() => setActiveImage(index)}
                onHoverStart={() => setActiveImage(index)}
              >
                {/* Clean Image Only - Silky Smooth Flowing Animation */}
                <Image
                  src={image.src}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={cn(
                    "object-cover transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-100 pointer-events-none select-none",
                    isActive ? "scale-105" : "scale-100"
                  )}
                  alt={image.alt || `Dakshina Showcase ${index + 1}`}
                  priority={index === 0}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeroAccordion;
