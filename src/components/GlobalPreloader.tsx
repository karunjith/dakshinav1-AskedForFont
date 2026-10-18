"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ArchitecturalLoader from "./ArchitecturalLoader";

export default function GlobalPreloader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);

  const isHomepage = pathname === "/";

  useEffect(() => {
    // Lock scroll instantly and keep top position while preloader is active
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }

    document.documentElement.classList.add("preloader-active", "lenis-stopped");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    let removeTimer: NodeJS.Timeout;
    let fallbackTimer: NodeJS.Timeout;
    let nonHomeTimer: NodeJS.Timeout;
    let introCheckTimer: NodeJS.Timeout;
    let dismissed = false;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      setIsFading(true);
      document.documentElement.classList.remove("preloader-active", "lenis-stopped");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lenis = (window as any).lenis;
        if (lenis && typeof lenis.start === "function") {
          lenis.start();
        }
      }

      removeTimer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    // Smooth quick progression helper for pages or devices without cinematic intro
    const runQuickProgress = (durationMs = 400) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (dismissed) {
          clearInterval(interval);
          return;
        }
        const elapsed = Date.now() - startTime;
        const p = Math.min(100, Math.round((elapsed / durationMs) * 100));
        setProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          nonHomeTimer = setTimeout(() => dismiss(), 200);
        }
      }, 25);

      return () => {
        clearInterval(interval);
        clearTimeout(nonHomeTimer);
      };
    };

    if (isHomepage) {
      // Check if intro animation is disabled in cached CMS settings for current screen width
      let isIntroEnabledOnScreen = true;
      try {
        const cached = localStorage.getItem("dakshina_cms_websiteContent");
        if (cached) {
          const parsed = JSON.parse(cached);
          const intro = parsed?.home?.introAnimation;
          if (intro) {
            if (intro.enabled === false) {
              isIntroEnabledOnScreen = false;
            } else {
              const w = window.innerWidth;
              if (w < 768 && intro.mobile === false) isIntroEnabledOnScreen = false;
              else if (w >= 768 && w < 1024 && intro.tablet === false) isIntroEnabledOnScreen = false;
              else if (w >= 1024 && intro.desktop === false) isIntroEnabledOnScreen = false;
            }
          }
        }
      } catch {}

      if (!isIntroEnabledOnScreen) {
        // Intro animation turned off on this screen size: complete quickly & smoothly
        const cleanupQuick = runQuickProgress(350);
        return () => {
          cleanupQuick();
          clearTimeout(removeTimer);
        };
      }

      let receivedFirstProgress = false;

      // Listen for genuine progress updates from CinematicIntro
      const handleProgress = (e: Event) => {
        receivedFirstProgress = true;
        clearTimeout(introCheckTimer);
        const customEvent = e as CustomEvent<{ progress: number }>;
        if (typeof customEvent.detail?.progress === "number") {
          setProgress(Math.min(99, customEvent.detail.progress));
        }
      };

      const handleReady = () => {
        clearTimeout(introCheckTimer);
        clearTimeout(fallbackTimer);
        setProgress(100);
        setTimeout(() => {
          dismiss();
        }, 350);
      };

      const handleDisabled = () => {
        clearTimeout(introCheckTimer);
        clearTimeout(fallbackTimer);
        runQuickProgress(300);
      };

      window.addEventListener("cinematic_progress", handleProgress);
      window.addEventListener("cinematic_ready", handleReady);
      window.addEventListener("cinematic_disabled", handleDisabled);

      // Fast check: If no cinematic progress received within 250ms (intro disabled or unmounted)
      introCheckTimer = setTimeout(() => {
        if (!receivedFirstProgress && !dismissed) {
          runQuickProgress(200);
        }
      }, 250);

      // Responsive fallback safety limit: guarantees instant entry without long wait
      fallbackTimer = setTimeout(() => {
        setProgress(100);
        dismiss();
      }, 700);

      return () => {
        window.removeEventListener("cinematic_progress", handleProgress);
        window.removeEventListener("cinematic_ready", handleReady);
        window.removeEventListener("cinematic_disabled", handleDisabled);
        clearTimeout(introCheckTimer);
        clearTimeout(fallbackTimer);
        clearTimeout(removeTimer);
      };
    } else {
      // Inner pages without CinematicIntro: smooth brief transition
      const cleanupQuick = runQuickProgress(400);
      return () => {
        cleanupQuick();
        clearTimeout(removeTimer);
      };
    }
  }, [isHomepage]);

  if (!isLoading) return null;

  return (
    <div
      id="preloader-barrier"
      className={`fixed inset-0 z-[999999] transition-opacity duration-600 ease-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#23281E",
        zIndex: 9999999,
        pointerEvents: isFading ? "none" : "auto",
      }}
    >
      <ArchitecturalLoader progress={progress} isReady={isFading} />
    </div>
  );
}
