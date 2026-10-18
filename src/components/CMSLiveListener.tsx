"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function notifyCMSChange() {
  if (typeof window === "undefined") return;
  const now = Date.now().toString();
  try {
    const channel = new BroadcastChannel("cms_live_channel");
    channel.postMessage({ type: "CMS_UPDATED", timestamp: now });
    channel.close();
  } catch {}
  
  try {
    localStorage.setItem("cms_last_sync", now);
    window.dispatchEvent(new CustomEvent("cms_content_changed", { detail: { timestamp: now } }));
  } catch {}
}

export default function CMSLiveListener() {
  const router = useRouter();

  useEffect(() => {
    let channel: BroadcastChannel | null = null;

    const handleSyncTrigger = () => {
      // Revalidate Server Components
      router.refresh();
      // Notify active client components to re-fetch dynamic state
      window.dispatchEvent(new CustomEvent("cms_reload_content"));
    };

    // 1. BroadcastChannel for modern cross-tab sync
    try {
      channel = new BroadcastChannel("cms_live_channel");
      channel.onmessage = (event) => {
        if (event.data?.type === "CMS_UPDATED") {
          handleSyncTrigger();
        }
      };
    } catch {}

    // 2. Storage event listener for cross-window / tab fallback
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cms_last_sync") {
        handleSyncTrigger();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 3. Custom event listener for same-tab updates
    window.addEventListener("cms_content_changed", handleSyncTrigger);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cms_content_changed", handleSyncTrigger);
    };
  }, [router]);

  return null;
}
