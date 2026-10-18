"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

export interface Project {
  id: number;
  title: string;
  category: string;
  location: string;
  image: string;
  images?: string[];
  year?: string;
  area?: string;
  materials?: string[];
  description?: string;
}

interface CommissionsPreviewProps {
  projects: Project[];
  onSelectProject?: (project: Project) => void;
}

export default function CommissionsPreview({ projects, onSelectProject }: CommissionsPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!projects || projects.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  const minSwipeDistance = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragOffset(0);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const curX = e.targetTouches[0].clientX;
    const curY = e.targetTouches[0].clientY;
    const diffX = curX - touchStartX;
    const diffY = curY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe dominant - provide 1:1 real-time drag feedback
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragOffset) > minSwipeDistance) {
      if (dragOffset < 0) {
        // Dragged left -> advance to next
        handleNext();
      } else {
        // Dragged right -> back to previous
        handlePrev();
      }
    }
    setDragOffset(0);
    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <section id="best-works" className="py-16 sm:py-20 md:py-32 overflow-hidden">
      <div className="container max-w-6xl px-4 sm:px-6 md:px-12 mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 md:mb-14">
          <div className="text-left">
            <span className="inline-block bg-[#8C421F]/10 px-3.5 py-1.5 rounded-full text-[10px] font-sans tracking-[0.25em] uppercase font-bold text-[#8C421F] mb-2.5 border border-[#8C421F]/20">
              FEATURED PROJECTS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl font-light text-[#23281E] tracking-tight">
              Our Selected Work
            </h2>
          </div>

          <Link
            href="/projects"
            className="font-sans text-xs tracking-widest uppercase font-semibold text-[#23281E] hover:text-[#8C421F] transition-colors flex items-center gap-1.5 group self-start md:self-auto border-b border-[#23281E]/20 pb-1"
          >
            EXPLORE FULL PORTFOLIO{" "}
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Link>
        </div>

        {/* Carousel Viewport Container with Static Chrome and Sliding Content */}
        <div 
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden touch-pan-y select-none shadow-2xl border border-[#8C421F]/30 bg-[#505B40] text-[#E8DACB] p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between"
        >
          {/* STATIC Header Bar: Swipe Hint & Fixed Counter (Does NOT move during swipe) */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#8C421F]/25 text-[10px] font-sans tracking-widest uppercase font-semibold text-[#E8DACB]/80 mb-4 sm:mb-6">
            <span className="flex items-center gap-1.5 text-[#B66C48]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B66C48] animate-pulse"></span>
              CURATED COMMISSIONS
            </span>
            <span className="bg-black/35 px-3 py-1 rounded-full border border-white/10 font-mono text-[#E8DACB]">
              {currentIndex + 1} / {projects.length}
            </span>
          </div>

          {/* SLIDING CONTENT VIEWPORT: Only the project image & details slide */}
          <div className="relative w-full overflow-hidden">
            <div 
              className="flex w-full items-stretch"
              style={{
                transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {projects.map((proj, idx) => (
                <div 
                  key={proj.id || idx}
                  className="w-full shrink-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-5 sm:gap-6 md:gap-8 lg:gap-12 items-stretch">
                    {/* Left Image Showcase */}
                    <div 
                      onClick={() => onSelectProject?.(proj)}
                      className="md:col-span-6 lg:col-span-7 relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-black/40 group shadow-md cursor-pointer border border-[#8C421F]/30 active:scale-[0.99] transition-transform"
                    >
                      <Image
                        src={proj.image}
                        alt={proj.title}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 55vw"
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 sm:p-6">
                        <span className="font-sans text-[11px] sm:text-xs tracking-widest uppercase text-[#E8DACB] font-semibold flex items-center gap-1.5 drop-shadow-md bg-black/40 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15">
                          View Project Details <ArrowUpRight size={13} className="text-[#B66C48]" />
                        </span>
                      </div>
                    </div>

                    {/* Right Details Column */}
                    <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between py-1 gap-4">
                      <div className="flex flex-col gap-2.5 sm:gap-4 text-left">
                        {/* Category & Location Sub-header Badge */}
                        <div>
                          <span className="inline-flex items-center gap-2 bg-black/35 px-3 py-1 rounded-full text-[10px] font-sans tracking-[0.2em] uppercase font-bold text-[#B66C48] border border-[#8C421F]/30 shadow-xs">
                            {proj.category.toUpperCase()} &bull; {proj.location.toUpperCase()}
                          </span>
                        </div>

                        {/* Project Title */}
                        <h3 
                          onClick={() => onSelectProject?.(proj)}
                          className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#E8DACB] leading-tight tracking-tight cursor-pointer hover:text-[#B66C48] transition-colors"
                        >
                          {proj.title}
                        </h3>

                        {/* Project Description */}
                        <p className="font-sans text-xs sm:text-sm md:text-base font-light text-[#E8DACB]/90 leading-relaxed line-clamp-3">
                          {proj.description}
                        </p>

                        {/* Specification Grid Cards */}
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-1">
                          <div className="bg-black/25 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col justify-center">
                            <span className="font-sans text-[9px] sm:text-[10px] tracking-widest uppercase text-[#B66C48] font-bold mb-0.5">
                              YEAR
                            </span>
                            <span className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-[#E8DACB]">
                              {proj.year || "2025"}
                            </span>
                          </div>
                          <div className="bg-black/25 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col justify-center">
                            <span className="font-sans text-[9px] sm:text-[10px] tracking-widest uppercase text-[#B66C48] font-bold mb-0.5">
                              SCALE
                            </span>
                            <span className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-[#E8DACB] uppercase">
                              {proj.area || "3,200 SQFT"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STATIC Bottom Action & Navigation Bar (Stays perfectly still during horizontal swipes) */}
          <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-[#8C421F]/30 gap-3 mt-4 sm:mt-6 z-20">
            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#E8DACB]/40 hover:border-[#B66C48] hover:bg-[#8C421F]/30 active:scale-90 flex items-center justify-center text-[#E8DACB] transition-all cursor-pointer touch-manipulation"
                aria-label="Previous Project"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#E8DACB]/40 hover:border-[#B66C48] hover:bg-[#8C421F]/30 active:scale-90 flex items-center justify-center text-[#E8DACB] transition-all cursor-pointer touch-manipulation"
                aria-label="Next Project"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Interactive Dot Indicators - Perfectly Centered & Still */}
            <div className="flex items-center gap-1.5">
              {projects.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === dotIdx ? "w-6 bg-[#B66C48]" : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to project ${dotIdx + 1}`}
                />
              ))}
            </div>

            {/* Details Button for currently active project */}
            <button
              onClick={() => onSelectProject?.(projects[currentIndex])}
              className="bg-[#8C421F] text-[#E8DACB] rounded-full px-4 py-2 sm:px-6 sm:py-3 font-sans text-[11px] sm:text-xs tracking-widest uppercase font-semibold flex items-center gap-1.5 hover:bg-[#B66C48] active:scale-95 transition-all duration-300 shadow-md cursor-pointer touch-manipulation"
            >
              DETAILS <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
