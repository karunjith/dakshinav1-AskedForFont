"use client";

import { useEffect, useState } from "react";

interface ArchitecturalLoaderProps {
  progress?: number;
  isReady?: boolean;
  logoUrl?: string;
}

export default function ArchitecturalLoader({ progress = 0, isReady = false, logoUrl }: ArchitecturalLoaderProps) {
  const [fetchedLogo, setFetchedLogo] = useState<string>("/uploads/da12-1785438293653.webp");
  const [logoError] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  const activeLogo = logoUrl || fetchedLogo;

  useEffect(() => {
    if (logoUrl) return;
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings?.logo) setFetchedLogo(d.settings.logo);
      })
      .catch(() => {});
  }, [logoUrl]);

  // Smoothly interpolate displayed percentage towards target real progress
  useEffect(() => {
    let animId: number;
    const target = Math.min(100, Math.max(0, progress));
    const step = () => {
      setDisplayProgress((curr) => {
        if (curr === target) return target;
        const diff = target - curr;
        const inc = Math.max(1, Math.ceil(diff * 0.2));
        const next = Math.min(target, curr + inc);
        if (next < target) {
          animId = requestAnimationFrame(step);
        }
        return next;
      });
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [progress]);

  if (isReady) return null;

  return (
    <div 
      onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="fixed inset-0 z-[99999] bg-[#23281E] flex flex-col items-center justify-center p-6 select-none overflow-hidden touch-none pointer-events-auto transition-opacity duration-500"
    >
      {/* Prominent Architectural Logo in #e8dacb matching the top navbar */}
      <div className="relative w-48 sm:w-60 md:w-72 h-24 sm:h-32 md:h-40 mb-6 flex items-center justify-center">
        {activeLogo && !logoError ? (
          <div 
            role="img"
            aria-label="Dakshina Architects"
            style={{
              backgroundColor: "#e8dacb",
              WebkitMaskImage: `url(${activeLogo})`,
              maskImage: `url(${activeLogo})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
            className="w-full h-full transition-all duration-300 filter drop-shadow-md"
          />
        ) : (
          <span className="font-serif font-light text-2xl sm:text-3xl tracking-tight text-[#e8dacb]">
            DAKSHINA <span className="text-[10px] font-sans tracking-widest text-[#B66C48] uppercase font-bold ml-1">ARCHITECTS</span>
          </span>
        )}
      </div>

      {/* Terracotta Loading Line Filling Animation */}
      <div className="w-48 sm:w-60 md:w-72 h-[3px] bg-white/15 relative overflow-hidden rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-[#8C421F] rounded-full transition-all duration-200 ease-out"
          style={{ width: `${displayProgress}%` }}
        ></div>
      </div>

      {/* Simple, Minimal & Professional Percentage Counter */}
      <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#e8dacb]/90 mt-3.5">
        {displayProgress}%
      </span>
    </div>
  );
}
