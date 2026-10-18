import posthog from "posthog-js";

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  // 1. PostHog Event Capture
  if (typeof window !== "undefined" && posthog.__loaded) {
    posthog.capture(name, properties);
  }

  // 2. Google Analytics Event Capture
  if (typeof window !== "undefined" && (window as unknown as { gtag?: (event: string, name: string, props?: Record<string, unknown>) => void }).gtag) {
    (window as unknown as { gtag: (event: string, name: string, props?: Record<string, unknown>) => void }).gtag("event", name, properties);
  }
}

export function trackCtaClick(label: string, destination: string) {
  trackEvent("cta_click", {
    cta_label: label,
    destination_url: destination,
  });
}

export function trackContactSubmit(projectType: string, aestheticTheme: string) {
  trackEvent("contact_form_submit", {
    project_type: projectType,
    aesthetic_theme: aestheticTheme,
  });
}

export function trackExternalClick(type: "whatsapp" | "phone" | "email" | "social", value: string) {
  trackEvent("external_click", {
    click_type: type,
    click_value: value,
  });
}
