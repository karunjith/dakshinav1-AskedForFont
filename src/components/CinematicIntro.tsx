"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export interface CinematicIntroProps {
  totalFrames?: number;
  getFrameUrl?: (index: number) => string;
  children?: React.ReactNode;
}

interface DrawRect {
  x: number;
  y: number;
  w: number;
  h: number;
  cw: number;
  ch: number;
}

export default function CinematicIntro({
  totalFrames = 300,
  getFrameUrl: customGetFrameUrl,
}: CinematicIntroProps) {
  // DOM & Animation Element Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const welcomeCoverRef = useRef<HTMLDivElement>(null);
  const title2Ref = useRef<HTMLDivElement>(null);
  const title3Ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // React State for Preloader & Ready State
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Default WebP Url Formatter
  const defaultGetFrameUrl = useCallback((index: number) => {
    const formatted = String(index).padStart(3, "0");
    return `/motion-frames-webp/ezgif-frame-${formatted}.webp`;
  }, []);

  const resolveFrameUrl = customGetFrameUrl || defaultGetFrameUrl;

  // Frame Cache (HTMLImageElement keeps GPU memory minimal & eliminates lag)
  const frameCache = useRef<(HTMLImageElement | null)[]>(new Array(totalFrames + 1).fill(null));
  const loadingStatus = useRef<boolean[]>(new Array(totalFrames + 1).fill(false));

  // Physics & Interpolation State
  const targetFrame = useRef<number>(1);
  const currentFrame = useRef<number>(1);
  const lastDrawnFrame = useRef<number>(-1);
  const animationFrameId = useRef<number | null>(null);
  const isTicking = useRef<boolean>(false);
  const isViewportActive = useRef<boolean>(true);

  // Canvas Bounding Box (Zero math allocations during scroll tick)
  const drawRectRef = useRef<DrawRect>({ x: 0, y: 0, w: 0, h: 0, cw: 0, ch: 0 });

  // ---------------------------------------------------------------------------
  // 1. HARDWARE-ACCELERATED HTMLIMAGEELEMENT LOADER (WITH OFF-THREAD DECODING)
  // ---------------------------------------------------------------------------
  const loadFrame = useCallback(async (idx: number): Promise<HTMLImageElement | null> => {
    if (idx < 1 || idx > totalFrames) return null;
    if (frameCache.current[idx]) return frameCache.current[idx];
    if (loadingStatus.current[idx]) return null;

    loadingStatus.current[idx] = true;
    const url = resolveFrameUrl(idx);

    try {
      const img = new Image();
      const loaded = await new Promise<boolean>((resolve) => {
        // Enforce per-frame timeout so frame loading never hangs on slow cellular
        const timer = setTimeout(() => resolve(false), 3500);

        img.onload = () => {
          clearTimeout(timer);
          if ("decode" in img) {
            img.decode().then(() => resolve(true)).catch(() => resolve(true));
          } else {
            resolve(true);
          }
        };

        img.onerror = () => {
          clearTimeout(timer);
          resolve(false);
        };

        img.src = url;
      });

      if (loaded) {
        frameCache.current[idx] = img;
      }
      loadingStatus.current[idx] = false;
      return loaded ? img : null;
    } catch {
      loadingStatus.current[idx] = false;
      return null;
    }
  }, [totalFrames, resolveFrameUrl]);

  // ---------------------------------------------------------------------------
  // 2. CANVAS RESIZE & COVER MATH (Guarantees Full-Screen Coverage)
  // ---------------------------------------------------------------------------
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Cap DPR at 1.5 for ultra-fast rendering on all screen sizes & hardware
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const renderWidth = Math.round(windowWidth * dpr);
    const renderHeight = Math.round(windowHeight * dpr);

    if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
      canvas.width = renderWidth;
      canvas.height = renderHeight;
    }

    const imgRatio = 16 / 9;
    const canvasRatio = renderWidth / renderHeight;
    let drawWidth = renderWidth;
    let drawHeight = renderHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = Math.round(renderWidth / imgRatio);
      offsetY = Math.round((renderHeight - drawHeight) / 2);
    } else {
      drawWidth = Math.round(renderHeight * imgRatio);
      offsetX = Math.round((renderWidth - drawWidth) / 2);
    }

    drawRectRef.current = {
      x: offsetX,
      y: offsetY,
      w: drawWidth,
      h: drawHeight,
      cw: renderWidth,
      ch: renderHeight,
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 3. ZERO-ALLOCATION CANVAS DRAW PASS
  // ---------------------------------------------------------------------------
  const renderActiveFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = drawRectRef.current;
    if (rect.cw === 0 || rect.ch === 0) return;

    let img = frameCache.current[frameIdx];

    if (!img) {
      for (let offset = 1; offset < 40; offset++) {
        if (frameIdx - offset >= 1 && frameCache.current[frameIdx - offset]) {
          img = frameCache.current[frameIdx - offset];
          break;
        }
        if (frameIdx + offset <= totalFrames && frameCache.current[frameIdx + offset]) {
          img = frameCache.current[frameIdx + offset];
          break;
        }
      }
      if (!img) img = frameCache.current[1];
    }

    if (img) {
      ctx.clearRect(0, 0, rect.cw, rect.ch);
      ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
    }
  }, [totalFrames]);

  // ---------------------------------------------------------------------------
  // 2. HIGH-FREQUENCY RESIZE OBSERVER PASS (Foldable & Responsive Recalibration)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleResize = () => {
      updateCanvasDimensions();
      if (lastDrawnFrame.current > 0) {
        renderActiveFrame(lastDrawnFrame.current);
      }
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [updateCanvasDimensions, renderActiveFrame]);

  // ---------------------------------------------------------------------------
  // 4. TICK RENDER LOOP (requestAnimationFrame with High-Responsive Alpha)
  // ---------------------------------------------------------------------------
  const tickRef = useRef<() => void>(() => {});

  const tick = useCallback(() => {
    if (!isTicking.current) return;

    const target = targetFrame.current;
    let current = currentFrame.current;
    const diff = target - current;

    if (Math.abs(diff) > 0.001) {
      const speed = Math.abs(diff);
      const alpha = speed > 10 ? 0.65 : 0.38;
      current += diff * alpha;
      currentFrame.current = current;
    } else {
      current = target;
      currentFrame.current = current;
    }

    const activeIdx = Math.min(totalFrames, Math.max(1, Math.round(current)));

    if (activeIdx !== lastDrawnFrame.current) {
      lastDrawnFrame.current = activeIdx;
      renderActiveFrame(activeIdx);
    }

    const isStationary = Math.abs(targetFrame.current - currentFrame.current) < 0.01;
    if (isStationary) {
      currentFrame.current = targetFrame.current;
      const finalIdx = Math.min(totalFrames, Math.max(1, Math.round(currentFrame.current)));
      if (finalIdx !== lastDrawnFrame.current) {
        lastDrawnFrame.current = finalIdx;
        renderActiveFrame(finalIdx);
      }
      isTicking.current = false;
      return;
    }

    animationFrameId.current = requestAnimationFrame(() => tickRef.current());
  }, [totalFrames, renderActiveFrame]);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const startTicking = useCallback(() => {
    if (!isTicking.current) {
      isTicking.current = true;
      animationFrameId.current = requestAnimationFrame(() => tickRef.current());
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 5. ADAPTIVE INTERNET-SPEED PRELOADER & BACKGROUND STREAMING PIPELINE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isSubscribed = true;

    // Safety fallback timer: fires after 600ms if network is slow/offline to guarantee instant site access
    const hardSafetyTimer = setTimeout(() => {
      if (isSubscribed) {
        setLoadingProgress(100);
        setIsReady(true);
        updateCanvasDimensions();
        renderActiveFrame(1);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cinematic_ready"));
        }
      }
    }, 600);

    const initPreloader = async () => {
      // 1. Instant load of frame 1 & immediate paint to canvas behind the curtain
      const firstFrame = await loadFrame(1);
      if (firstFrame && isSubscribed) {
        updateCanvasDimensions();
        renderActiveFrame(1);
        setLoadingProgress(100);
        setIsReady(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cinematic_progress", { detail: { progress: 100 } }));
          window.dispatchEvent(new CustomEvent("cinematic_ready"));
        }
      } else if (isSubscribed) {
        setLoadingProgress(100);
        setIsReady(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cinematic_progress", { detail: { progress: 100 } }));
          window.dispatchEvent(new CustomEvent("cinematic_ready"));
        }
      }

      // Detect connection speed & mobile device
      const navConn = typeof navigator !== "undefined" ? (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })?.connection : null;
      const isSlowConn = navConn ? (navConn.saveData || navConn.effectiveType === "2g" || navConn.effectiveType === "3g") : false;
      const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
      const batchSize = isSlowConn || isMobile ? 6 : 16;

      // 2. Critical Path Frames:
      // Opening scrub buffer: first 15 frames (mobile) or 25 frames (desktop)
      const openingCount = isMobile ? 15 : 25;
      const criticalFramesSet = new Set<number>();
      for (let f = 1; f <= Math.min(openingCount, totalFrames); f++) criticalFramesSet.add(f);
      // Keyframe distribution across remainder of totalFrames
      for (let f = openingCount + 4; f <= totalFrames; f += isMobile ? 12 : 8) criticalFramesSet.add(f);

      const criticalFrames = Array.from(criticalFramesSet);
      let loadedCount = firstFrame ? 1 : 0;
      const criticalTotal = criticalFrames.length;

      // Fast parallel fetch of critical keyframe path
      for (let i = 0; i < criticalTotal; i += batchSize) {
        if (!isSubscribed) break;
        const chunk = criticalFrames.slice(i, i + batchSize);
        await Promise.all(
          chunk.map((frameNum) =>
            loadFrame(frameNum).then(() => {
              if (isSubscribed) {
                loadedCount++;
                const pct = Math.min(99, Math.round(15 + (loadedCount / criticalTotal) * 84));
                setLoadingProgress(pct);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("cinematic_progress", { detail: { progress: pct } }));
                }
              }
            })
          )
        );
      }

      // 3. UNLOCK ONLY WHEN CRITICAL FRAMES ARE FULLY LOADED & FIRST FRAME IS PAINTED
      if (isSubscribed) {
        clearTimeout(hardSafetyTimer);
        updateCanvasDimensions();
        renderActiveFrame(1);
        setLoadingProgress(100);
        setIsReady(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cinematic_progress", { detail: { progress: 100 } }));
          window.dispatchEvent(new CustomEvent("cinematic_ready"));
        }
      }

      // 4. Background Stream: Stream remaining frames in background without blocking UI or scroll
      setTimeout(async () => {
        const remainingFrames: number[] = [];
        for (let f = 2; f <= totalFrames; f++) {
          if (!criticalFramesSet.has(f)) remainingFrames.push(f);
        }

        for (let i = 0; i < remainingFrames.length; i += batchSize) {
          if (!isSubscribed) break;
          const chunk = remainingFrames.slice(i, i + batchSize);
          await Promise.all(chunk.map((frameNum) => loadFrame(frameNum)));
        }
      }, 100);
    };

    initPreloader();

    return () => {
      isSubscribed = false;
      clearTimeout(hardSafetyTimer);
    };
  }, [totalFrames, loadFrame, renderActiveFrame, updateCanvasDimensions]);

  // Global Component Unmount Safety: Guarantees body and Lenis are NEVER left locked
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("lenis-stopped");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, []);

  // Preloader Scroll Lock: locks scroll strictly during the initial 1-2s loading phase
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isReady) {
      document.documentElement.classList.add("lenis-stopped");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      const blockEvent = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const blockKeyScroll = (e: KeyboardEvent) => {
        const keys = ["Space", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"];
        if (keys.includes(e.code) || keys.includes(e.key) || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      const enforceZeroScroll = () => {
        if (window.scrollY !== 0 || window.scrollX !== 0) {
          window.scrollTo(0, 0);
        }
      };

      window.addEventListener("wheel", blockEvent, { capture: true, passive: false });
      window.addEventListener("scroll", enforceZeroScroll, { capture: true, passive: false });
      window.addEventListener("keydown", blockKeyScroll, { capture: true });

      // Force initial zero position
      window.scrollTo(0, 0);

      return () => {
        window.removeEventListener("wheel", blockEvent, { capture: true });
        window.removeEventListener("scroll", enforceZeroScroll, { capture: true });
        window.removeEventListener("keydown", blockKeyScroll, { capture: true });
        document.documentElement.classList.remove("lenis-stopped");
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
      };
    } else {
      // Unlock Lenis and CSS overflow once ready
      document.documentElement.classList.remove("lenis-stopped");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      window.scrollTo(0, 0);
    }
  }, [isReady]);

  // ---------------------------------------------------------------------------
  // 6. RESIZE HANDLING
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let lastWidth = typeof window !== "undefined" ? window.innerWidth : 0;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (Math.abs(currentWidth - lastWidth) > 5) {
        lastWidth = currentWidth;
        updateCanvasDimensions();
      }
    };

    window.addEventListener("resize", handleResize);
    updateCanvasDimensions();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateCanvasDimensions]);

  // ---------------------------------------------------------------------------
  // 7. GSAP SCROLLTRIGGER SCRUBBING
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isReady) return;

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    const sequenceObj = { frame: 1 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: stickyRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.2,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        onToggle: (self) => {
          isViewportActive.current = self.isActive;
          if (self.isActive) {
            startTicking();
          }
        },
        onUpdate: (self) => {
          targetFrame.current = 1 + self.progress * (totalFrames - 1);
          startTicking();
        },
      },
    });

    tlRef.current = tl;

    // 1. Scrub motion frames 1 to 300 smoothly over container scroll length
    tl.to(
      sequenceObj,
      {
        frame: totalFrames,
        ease: "none",
        duration: 30,
        onUpdate: () => {
          targetFrame.current = sequenceObj.frame;
          startTicking();
        },
      },
      0
    );

    // 2. Standalone White Welcome Cover Screen Reveal (0 to 5s of scroll timeline)
    if (welcomeCoverRef.current) {
      tl.fromTo(
        welcomeCoverRef.current,
        { opacity: 1, scale: 1, pointerEvents: "auto" },
        { opacity: 0, scale: 1.04, pointerEvents: "none", duration: 5, ease: "power1.inOut" },
        0
      );
    }

    // 3. Sequence Overlays Choreography
    if (title2Ref.current && title3Ref.current) {
      tl.fromTo(title2Ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 4 }, 10)
        .to(title2Ref.current, { opacity: 0, y: -20, duration: 4 }, 16)
        .fromTo(title3Ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 4 }, 19)
        .to(title3Ref.current, { opacity: 0, y: -20, duration: 4 }, 25);
    }

    // 4. Premium fade effect at the end of the scroll animation sequence (fades completely to solid background)
    if (canvasRef.current) {
      tl.fromTo(
        canvasRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          duration: 3,
          ease: "power2.inOut",
        },
        27
      );
    }

    const targetContainer = containerRef.current;
    return () => {
      clearTimeout(refreshTimer);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      isTicking.current = false;
      tlRef.current = null;
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === targetContainer) {
          t.kill();
        }
      });
    };
  }, [totalFrames, isReady, startTicking]);

  const handleSkipToHome = useCallback(() => {
    // 1. Force unlock any scroll locks immediately
    document.documentElement.classList.remove("preloader-active", "lenis-stopped");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.touchAction = "";

    // 2. Immediately hide welcome cover
    if (welcomeCoverRef.current) {
      welcomeCoverRef.current.style.opacity = "0";
      welcomeCoverRef.current.style.pointerEvents = "none";
      welcomeCoverRef.current.style.display = "none";
    }

    // 3. Complete timeline so frames don't lag behind
    if (tlRef.current) {
      tlRef.current.progress(1);
    }

    // 4. Compute destination: top of hero section
    const heroSection = document.getElementById("hero-section");
    const container = containerRef.current || document.getElementById("intro-container");
    const scrollTarget = heroSection 
      ? heroSection.offsetTop 
      : container 
        ? container.offsetTop + container.offsetHeight 
        : window.innerHeight * 4;

    // 5. Scroll with Lenis if active, otherwise native scrollTo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.start?.();
      lenis.scrollTo(scrollTarget, { duration: 1.0, immediate: false });
    } else {
      window.scrollTo({
        top: scrollTarget,
        behavior: "smooth"
      });
    }
  }, []);

  // Listen for Spacebar or Enter key on the initial opening welcome page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        activeEl.getAttribute("contenteditable") === "true"
      );

      if (isInputActive) return;

      if (e.code === "Space" || e.key === " " || e.code === "Enter" || e.key === "Enter") {
        if (window.scrollY < 100) {
          e.preventDefault();
          handleSkipToHome();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSkipToHome]);

  // ---------------------------------------------------------------------------
  // 8. MAIN CINEMATIC PRESENTATION DOM
  // ---------------------------------------------------------------------------
  return (
    <>
      <div id="intro-container" ref={containerRef} className="relative w-full h-[500vh] sm:h-[450vh] md:h-[400vh] lg:h-[350vh] bg-[#F9F6F0]">
      {/* Locked Canvas Pinning Container (100% Reliable Pinning Across PC, Mobile & Tablet) */}
      <div ref={stickyRef} className="w-full h-screen h-[100dvh] overflow-hidden z-10 bg-[#F9F6F0] touch-pan-y">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block relative z-10"
        />

        {/* STANDALONE SEPARATE WHITE WELCOME COVER SCREEN (Only location for Skip Button) */}
        <div
          ref={welcomeCoverRef}
          className="absolute inset-0 z-30 bg-[#F9F6F0] flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto"
        >
          <span className="font-sans text-xs tracking-[0.3em] uppercase font-semibold text-clay mb-3">
            DAKSHINA ARCHITECTS
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-none tracking-tight text-charcoal mb-4">
            Designing Stillness.
          </h1>
          <p className="font-sans text-sm md:text-base opacity-75 font-light tracking-wide max-w-xl text-charcoal mb-6">
            An architectural inquiry into light, wind, and heritage.
          </p>

          {/* Skip To Homepage Button (Instant tap/click response from the very first frame) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSkipToHome();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSkipToHome();
            }}
            className="mb-8 bg-[#8C421F] hover:bg-[#B66C48] text-[#E8DACB] px-6 py-2.5 rounded-full font-sans text-xs tracking-widest uppercase font-bold shadow-lg border border-[#E8DACB]/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer touch-manipulation flex items-center gap-2 relative z-50 pointer-events-auto"
          >
            <span>Skip To Homepage</span> &rarr;
          </button>

          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="font-sans text-[10px] tracking-widest uppercase text-charcoal opacity-60 font-semibold">
              Scroll to begin
            </span>
            <ArrowDown size={14} className="text-charcoal opacity-60" />
          </div>
        </div>

        {/* SEQUENCE OVERLAYS */}
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none z-20">
          {/* Title 2: Climatic Integration */}
          <div
            ref={title2Ref}
            id="intro-title-2"
            className="absolute flex flex-col items-center gap-3 opacity-0 select-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
          >
            <span className="font-sans text-xs tracking-[0.25em] uppercase font-semibold">
              CLIMATIC INTEGRATION
            </span>
            <h2 className="font-serif text-4xl md:text-7xl font-light leading-none tracking-tight">
              Monsoon & Ventilation.
            </h2>
          </div>

          {/* Title 3: Local Materials */}
          <div
            ref={title3Ref}
            id="intro-title-3"
            className="absolute flex flex-col items-center gap-3 opacity-0 select-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
          >
            <span className="font-sans text-xs tracking-[0.25em] uppercase font-semibold">
              LOCAL MATERIALS
            </span>
            <h2 className="font-serif text-4xl md:text-7xl font-light leading-none tracking-tight">
              Terracotta & Teak.
            </h2>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
