"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { gsap } from "gsap";
import { X, Calendar, MapPin, Minimize, Hammer, ChevronLeft, ChevronRight } from "lucide-react";

export interface Project {
  id: number | string;
  title: string;
  category: string;
  location: string;
  image: string;
  images?: string[];
  year?: string;
  area?: string;
  materials?: string[];
  description?: string;
  status?: string;
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Hydrate client-side mount to safely bind portal to document.body
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const [touchOffset, setTouchOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);

  // Reset index on project changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveImgIdx(0);
      setTouchOffset(0);
      setIsSwiping(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [project]);

  useEffect(() => {
    if (isOpen && project && mounted) {
      document.documentElement.classList.add("lenis-stopped");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      
      // GSAP slide in overlay and pop box
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: "flex", ease: "power2.out" });
      gsap.fromTo(modalBoxRef.current, 
        { scale: 0.95, y: 15, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.2)" }
      );
    } else {
      document.documentElement.classList.remove("lenis-stopped");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      
      if (mounted) {
        gsap.to(modalBoxRef.current, { scale: 0.95, y: 10, opacity: 0, duration: 0.25, ease: "power2.in" });
        gsap.to(overlayRef.current, { 
          opacity: 0, 
          duration: 0.25, 
          display: "none",
          ease: "power2.in",
          onComplete: () => {
            document.documentElement.classList.remove("lenis-stopped");
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
          }
        });
      }
    }
    return () => {
      document.documentElement.classList.remove("lenis-stopped");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen, project, mounted]);

  const handleImageTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      setIsSwiping(true);
      setTouchOffset(0);
    }
  };

  const handleImageTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    if (e.touches && e.touches[0]) {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - touchStartXRef.current;
      const diffY = currentY - touchStartYRef.current;

      // Track horizontal drag visually only when gesture is horizontal
      if (Math.abs(diffX) > Math.abs(diffY)) {
        setTouchOffset(diffX);
      }
    }
  };

  const handleImageTouchEnd = (e: React.TouchEvent, total: number) => {
    setIsSwiping(false);
    if (touchStartXRef.current === null || touchStartYRef.current === null || total <= 1) {
      setTouchOffset(0);
      return;
    }
    if (e.changedTouches && e.changedTouches[0]) {
      const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
      const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

      // Check for horizontal swipe gesture (> 35px horizontal travel and mostly horizontal)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX > 0) {
          // Swipe left -> Next image
          setActiveImgIdx((prev) => (prev === total - 1 ? 0 : prev + 1));
        } else {
          // Swipe right -> Previous image
          setActiveImgIdx((prev) => (prev === 0 ? total - 1 : prev - 1));
        }
      }
    }
    setTouchOffset(0);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  if (!mounted || !project) return null;

  // React Portal targets body to bypass layout transforms (Requirement 3)
  return createPortal(
    <div 
      className="fixed inset-0 bg-black/65 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 opacity-0 overscroll-contain select-none"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onWheel={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      style={{ display: "none" }}
    >
      <div 
        data-lenis-prevent="true"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", overscrollBehavior: "contain" }}
        className="w-full max-w-4xl h-auto max-h-[88vh] md:h-[80vh] md:max-h-[640px] bg-[#FDFBF7] shadow-2xl rounded-2xl md:rounded-3xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative no-scrollbar scrollbar-none border border-[#8C421F]/20 cursor-default"
        ref={modalBoxRef}
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Absolute Close Button - Optimized for easy mobile thumb tap */}
        <button 
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 md:bg-white/90 md:hover:bg-white text-white md:text-charcoal hover:text-clay shadow-lg md:shadow-xs border border-white/20 md:border-charcoal/10 transition-all duration-300 cursor-pointer touch-manipulation flex items-center justify-center active:scale-90"
          onClick={onClose} 
          aria-label="Close details modal"
        >
          <X size={18} />
        </button>

        {/* Left image column with smooth slideshow & real-time touch swipe */}
        {(() => {
          const projectImages = project.images && project.images.length > 0 
            ? project.images 
            : [project.image];
          const currentImg = projectImages[activeImgIdx] || project.image;
          
          return (
            <div 
              onTouchStart={handleImageTouchStart}
              onTouchMove={handleImageTouchMove}
              onTouchEnd={(e) => handleImageTouchEnd(e, projectImages.length)}
              className="w-full aspect-[16/11] sm:aspect-[16/10] md:aspect-auto md:w-1/2 md:h-full shrink-0 relative bg-neutral-900 group/img select-none overflow-hidden touch-pan-y"
            >
              {/* Continuous Sliding Image Track */}
              <div 
                className="w-full h-full flex"
                style={{
                  transform: `translateX(calc(-${activeImgIdx * 100}% + ${touchOffset}px))`,
                  transition: isSwiping ? "none" : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {projectImages.map((imgSrc, imgIdx) => (
                  <div key={imgIdx} className="w-full h-full shrink-0 relative">
                    <Image 
                      src={imgSrc} 
                      alt={`${project.title} slide ${imgIdx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover pointer-events-none"
                      priority={imgIdx === 0}
                    />
                  </div>
                ))}
              </div>
              
              {projectImages.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIdx((prev) => (prev === 0 ? projectImages.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/75 text-white shadow-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-90 opacity-90 sm:opacity-0 sm:group-hover/img:opacity-100 touch-manipulation flex items-center justify-center border border-white/20"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIdx((prev) => (prev === projectImages.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/75 text-white shadow-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-90 opacity-90 sm:opacity-0 sm:group-hover/img:opacity-100 touch-manipulation flex items-center justify-center border border-white/20"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={16} />
                  </button>
                  
                  {/* Progress dots & swipe counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/15">
                    <div className="flex gap-1.5">
                      {projectImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImgIdx(idx);
                          }}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 touch-manipulation ${
                            activeImgIdx === idx ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <span className="font-sans text-[10px] text-white/80 font-medium tracking-wider pl-1 border-l border-white/20">
                      {activeImgIdx + 1}/{projectImages.length}
                    </span>
                  </div>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent pointer-events-none"></div>
            </div>
          );
        })()}

        {/* Right content column */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-5 sm:p-6 md:p-8 bg-[#FDFBF7] md:overflow-y-auto">
          
          <div className="flex flex-col gap-1 border-b border-[#8C421F]/15 pb-4">
            <span className="font-sans text-[10px] sm:text-xs tracking-widest uppercase text-[#8C421F] font-bold">
              {project.category}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight text-[#23281E]">
              {project.title}
            </h2>
          </div>

          <div className="grow flex flex-col gap-3 py-4">
            <h4 className="font-sans text-[10px] tracking-widest uppercase text-[#505B40] font-bold border-l-2 border-[#8C421F] pl-2.5">
              Design Thesis
            </h4>
            <div className="overflow-y-auto pr-1 max-h-[160px] md:max-h-[220px] scrollbar-thin">
              <p className="font-sans text-xs sm:text-sm text-[#23281E]/80 font-light leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#8C421F]/15 bg-[#E8DACB]/35 p-3.5 sm:p-4 rounded-xl border border-[#8C421F]/10">
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-[#8C421F] shrink-0 mt-0.5" />
              <div>
                <span className="font-sans text-[9px] tracking-wider uppercase text-[#23281E]/60 block font-semibold">Location</span>
                <p className="text-xs text-[#23281E] font-medium">{project.location}, Kerala</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Calendar size={13} className="text-[#8C421F] shrink-0 mt-0.5" />
              <div>
                <span className="font-sans text-[9px] tracking-wider uppercase text-[#23281E]/60 block font-semibold">Completed</span>
                <p className="text-xs text-[#23281E] font-medium">{project.year || "2025"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Minimize size={13} className="text-[#8C421F] shrink-0 mt-0.5" />
              <div>
                <span className="font-sans text-[9px] tracking-wider uppercase text-[#23281E]/60 block font-semibold">Built Area</span>
                <p className="text-xs text-[#23281E] font-medium">{project.area || "2,400 sq.ft."}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Hammer size={13} className="text-[#8C421F] shrink-0 mt-0.5" />
              <div>
                <span className="font-sans text-[9px] tracking-wider uppercase text-[#23281E]/60 block font-semibold">Materials</span>
                <p className="text-xs text-[#23281E] font-medium truncate max-w-[130px] sm:max-w-[150px]">
                  {(project.materials || []).join(", ") || "Teak, Clay, Granite"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
