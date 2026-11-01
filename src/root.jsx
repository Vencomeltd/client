import { useEffect } from "react";
import { Meta, Links, Scripts, Outlet, ScrollRestoration, redirect } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ChatProvider } from "./context/ChatContext.jsx";
import { TranslationProvider } from "./context/TranslationContext.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";
import SupportChatWidget from "./components/SupportChatWidget.jsx";
import NavigationProgress from "./components/NavigationProgress.jsx";
import "./index.css";
import { SITE_CONTENT_DEFAULTS, SEO_PAGE_BY_PATH } from "./content/siteContent";

// Same provider tree main.jsx/App.jsx used to set up around
// <ReactDOM.createRoot>/<Router>/<AppContent> -- the framework now
// provides routing and mounting itself, so only the providers (and the
// global stylesheet import, previously pulled in by main.jsx) move here.
// Private-route pages (PrivateRoute/HostRoute/etc.) depend on AuthProvider
// being an ancestor, same as before.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 2 * 60 * 1000, refetchOnWindowFocus: false },
  },
});

// Fetched once per request so Footer (rendered on every page) can list real
// category/city links server-side, instead of a client-only fetch that
// would defeat the point for crawlers. Same endpoints Homepage already uses.
// Spec rule 2: lowercase, no trailing slash, one 301 to the canonical form
// (query string kept). Token routes are left alone -- their case matters.
const CASE_SENSITIVE_PREFIXES = ["/support-access/"];
function canonicalPath(pathname) {
  let path = pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname;
  const lower = path.toLowerCase();
  if (!CASE_SENSITIVE_PREFIXES.some((prefix) => lower.startsWith(prefix))) path = lower;
  return path;
}

// Published site-text overrides (admin -> Site content). Fetched on its own
// so a failure only means the bundled defaults are shown.
async function loadSiteContent() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/site-content`);
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const path = canonicalPath(url.pathname);
  if (path !== url.pathname) throw redirect(`${path}${url.search}`, 301);

  const siteContent = await loadSiteContent();
  try {
    const [categoriesRes, linksRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/categories/with-counts`),
      fetch(`${import.meta.env.VITE_API_URL}/landing/links`),
    ]);
    const categories = categoriesRes.ok ? await categoriesRes.json() : [];
    const links = linksRes.ok ? await linksRes.json() : { cities: [], services: [] };
    return {
      // Footer now links every category and subcategory (not just ones
      // with current listings) so the full taxonomy is crawlable/browsable
      // from day one -- see Footer.jsx's category grid.
      footerCategories: Array.isArray(categories) ? categories : [],
      // City and service links point at the SEO landing pages (/uk/london,
      // /chairs); the server only returns pages that exist.
      footerCities: links.cities || [],
      footerServicePaths: Object.fromEntries((links.services || []).map((s) => [s.name, s.path])),
      siteContent,
    };
  } catch {
    return { footerCategories: [], footerCities: [], footerServicePaths: {}, siteContent };
  }
}

// Site-wide default meta -- individual route modules (PropertyDetails,
// BlogDetails, etc.) export their own `meta()` which overrides title/
// description/OG here per React Router's route-hierarchy meta merging
// (deepest matched route wins for same-named tags; multiple
// "script:ld+json" entries across matched routes all render, so this
// Organization/WebSite schema coexists with a route's own Product schema).
// The root loader's data (footer categories + city/service links) is the
// same on every page, but React Router re-runs it on every client-side
// navigation by default -- so every click waited on a server round-trip,
// even to pages with no data of their own (About, FAQ, ...). Load it once
// per visit; still refresh after form submissions.
export function shouldRevalidate({ formMethod, defaultShouldRevalidate }) {
  if (formMethod && formMethod.toUpperCase() !== "GET") return defaultShouldRevalidate;
  return false;
}

export function meta({ location, data }) {
  // Static pages (home, about, contact) take their title/description from
  // Site content; everything else uses the site-wide default.
  const page = SEO_PAGE_BY_PATH[location?.pathname || "/"] || "home";
  const text = (key) => data?.siteContent?.[key] ?? SITE_CONTENT_DEFAULTS[key];
  const title = text(`seo.${page}.title`);
  const description = text(`seo.${page}.description`);
  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    // Default canonical for the homepage and static pages that have no meta of
    // their own. Pages with their own meta export set their own canonical.
    { tagName: "link", rel: "canonical", href: `https://www.vencome.com${location?.pathname || "/"}` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: "https://www.vencome.com/vencome-og.jpg" },
    { property: "og:site_name", content: "VenCome" },
    { property: "og:locale", content: "en_GB" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://www.vencome.com/vencome-og.jpg" },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "VenCome",
        url: "https://www.vencome.com",
        logo: "https://www.vencome.com/VenCome.jpg",
        description:
          "B2B marketplace for commercial spaces connecting business hosts with professional tenants across the UK.",
        address: { "@type": "PostalAddress", addressCountry: "GB" },
        sameAs: ["https://vencome.com"],
      },
    },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "VenCome",
        url: "https://www.vencome.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.vencome.com/search?query={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    },
  ];
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        {import.meta.env.VITE_GA_MEASUREMENT_ID ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${import.meta.env.VITE_GA_MEASUREMENT_ID}');`,
              }}
            />
          </>
        ) : null}
        {/* Tried Tidio here in place of the custom SupportChatWidget, but its
            widget script (code.tidio.co/...) now returns 403 Forbidden --
            looks like the free plan lapsed. Reverted to SupportChatWidget
            below, in Root(). */}
        {/* Google requires a favicon that's a real multiple of 48px, in a
            supported format, on a stable crawlable URL. */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Fires once per browser session (sessionStorage-deduped, not localStorage --
// a returning visitor days later is a new "how did they find us" signal, not
// the same one) so the admin visitor-analytics panel has real country/
// referrer data without needing GA4 API access.
function useVisitorTracking() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("vencome_visit_tracked")) return;
      sessionStorage.setItem("vencome_visit_tracked", "1");
      const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      fetch(`${import.meta.env.VITE_API_URL}/track-visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          referrer: document.referrer || "",
          landingPage: window.location.pathname,
        }),
      }).catch(() => {});
    } catch {
      // Tracking must never break the app.
    }
  }, []);
}

export default function Root() {
  useVisitorTracking();
  return (
    <ChatProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <NotificationProvider>
            <TranslationProvider>
              <CurrencyProvider>
                <QueryClientProvider client={queryClient}>
                  <ToastContainer position="top-right" autoClose={4000} />
                  <NavigationProgress />
                  <Outlet />
                  <SupportChatWidget />
                </QueryClientProvider>
              </CurrencyProvider>
            </TranslationProvider>
          </NotificationProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ChatProvider>
  );
}
