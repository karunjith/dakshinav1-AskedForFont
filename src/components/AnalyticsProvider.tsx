"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import posthog from "posthog-js";

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize PostHog client-side on mount
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        capture_pageview: false, // Track manually to avoid duplicate counts on route changes
        persistence: "cookie",
      });
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      // 1. PostHog Pageview tracking
      if (typeof window !== "undefined" && posthog.__loaded) {
        let url = window.origin + pathname;
        if (searchParams?.toString()) {
          url += `?${searchParams.toString()}`;
        }
        posthog.capture("$pageview", { $current_url: url });
      }

      // 2. Google Analytics Pageview tracking
      const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-E4D7EC6A6D";
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("config", gaId, {
          page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
        });
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-E4D7EC6A6D"; // Fallback placeholder

  return (
    <>
      {/* Google Analytics 4 Script Tags */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  );
}
