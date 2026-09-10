// Thin wrapper around window.gtag -- a no-op when GA4 isn't installed (no
// VITE_GA_MEASUREMENT_ID set, ad blocker, etc.) so call sites never need to
// guard for that themselves.
export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
