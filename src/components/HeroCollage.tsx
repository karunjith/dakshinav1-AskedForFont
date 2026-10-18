"use client";

import { useState } from "react";
import Image from "next/image";

interface DiamondPhoto {
  id: string;
  src: string;
  alt: string;
  title: string;
  className: string;
}

interface HeroCollageProps {
  customImages?: Record<string, string>;
}

export default function HeroCollage({ customImages }: HeroCollageProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const photos: DiamondPhoto[] = [
    {
      id: "center",
      src: customImages?.center || "/images/hero_interior.jpg",
      alt: "The Backwater Pavilion Villa",
      title: "Backwater Pavilion",
      className: "w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 sm:border-6"
    },
    {
      id: "top-left",
      src: customImages?.topLeft || "/images/parallax_facade.jpg",
      alt: "Heritage Kerala Facade",
      title: "Coastal Facade",
      className: "w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 z-10 top-2 left-4 sm:top-4 sm:left-8 md:top-5 md:left-10 border-3 sm:border-4"
    },
    {
      id: "top-right",
      src: customImages?.topRight || "/images/parallax_courtyard.jpg",
      alt: "Traditional Courtyard Lightwell",
      title: "Open Courtyard",
      className: "w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 z-10 top-2 right-4 sm:top-4 sm:right-8 md:top-5 md:right-10 border-3 sm:border-4"
    },
    {
      id: "bottom-left",
      src: customImages?.bottomLeft || "/images/parallax_verandah.jpg",
      alt: "Teak Verandah Living",
      title: "Teak Verandah",
      className: "w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 z-10 bottom-2 left-4 sm:bottom-4 sm:left-8 md:bottom-5 md:left-10 border-3 sm:border-4"
    },
    {
      id: "bottom-right",
      src: customImages?.bottomRight || "/images/parallax_dining.jpg",
      alt: "Tropical Living Space",
      title: "Heritage Dining",
      className: "w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 z-10 bottom-2 right-4 sm:bottom-4 sm:right-8 md:bottom-5 md:right-10 border-3 sm:border-4"
    },
    {
      id: "top-center",
      src: customImages?.topCenter || "/images/parallax_lounge.jpg",
      alt: "Sunlit Courtyard Lounge",
      title: "Courtyard Lounge",
      className: "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 z-15 -top-2 left-1/2 -translate-x-1/2 border-2 sm:border-3"
    },
    {
      id: "left-center",
      src: customImages?.leftCenter || "/images/portfolio_office.jpg",
      alt: "Vazhicherry Studio",
      title: "Design Studio",
      className: "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 z-15 left-0 top-1/2 -translate-y-1/2 border-2 sm:border-3"
    },
    {
      id: "right-center",
      src: customImages?.rightCenter || "/images/parallax_screen.jpg",
      alt: "Louvered Wooden Screen",
      title: "Louvered Screen",
      className: "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 z-15 right-0 top-1/2 -translate-y-1/2 border-2 sm:border-3"
    },
    {
      id: "bottom-center",
      src: customImages?.bottomCenter || "/images/slider_after.jpg",
      alt: "Alleppey Canal House",
      title: "Alleppey Residence",
      className: "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 z-15 -bottom-2 left-1/2 -translate-x-1/2 border-2 sm:border-3"
    }
  ];

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[440px] md:max-w-[500px] lg:max-w-[540px] aspect-square mx-auto flex items-center justify-center p-2 sm:p-4 select-none group">
      {/* Decorative Ambient Soft Glow */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#8C421F]/15 via-transparent to-[#23281E]/10 blur-2xl group-hover:scale-105 transition-transform duration-700 pointer-events-none"></div>

      {/* Flat Responsive Diamond Matrix Container */}
      <div className="relative w-full h-full">
        {photos.map((photo) => {
          const isHovered = hoveredId === photo.id;

          return (
            <div
              key={photo.id}
              className={`absolute rounded-xl overflow-hidden bg-white border-white shadow-lg transition-all duration-300 ease-out cursor-pointer transform ${
                photo.className
              } ${
                isHovered 
                  ? "scale-110 z-40 shadow-2xl border-[#8C421F]" 
                  : "hover:scale-105 hover:z-30 hover:shadow-xl"
              }`}
              style={{
                transform: `rotate(45deg) ${isHovered ? "scale(1.1)" : "scale(1)"}`,
                transformOrigin: "center center",
              }}
              onMouseEnter={() => setHoveredId(photo.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Counter-rotate image to keep photo right-side up inside diamond frame */}
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 140px, (max-width: 1024px) 220px, 300px"
                  className="object-cover -rotate-45 scale-145 transition-transform duration-500 group-hover:scale-150"
                />

                {/* Subtle Inner Overlay on Touch/Hover */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "bg-black/10" : "bg-transparent"}`}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
