import { Meta, Links, Scripts, Outlet, ScrollRestoration } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ChatProvider } from "./context/ChatContext.jsx";
import "./index.css";

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
export async function loader() {
  try {
    const [categoriesRes, citiesRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/categories/with-counts`),
      fetch(`${import.meta.env.VITE_API_URL}/properties/cities`),
    ]);
    const categories = categoriesRes.ok ? await categoriesRes.json() : [];
    const citiesData = citiesRes.ok ? await citiesRes.json() : { countries: [] };
    return {
      footerCategories: Array.isArray(categories) ? categories.filter((c) => c.hasListings) : [],
      footerCities: (citiesData.countries || []).flatMap((c) => c.cities || []),
    };
  } catch {
    return { footerCategories: [], footerCities: [] };
  }
}

// Site-wide default meta -- individual route modules (PropertyDetails,
// BlogDetails, etc.) export their own `meta()` which overrides title/
// description/OG here per React Router's route-hierarchy meta merging
// (deepest matched route wins for same-named tags; multiple
// "script:ld+json" entries across matched routes all render, so this
// Organization/WebSite schema coexists with a route's own Product schema).
export function meta() {
  const title = "VenCome – Book & List Beauty & Wellness Spaces | UK";
  const description =
    "VenCome is the UK's B2B marketplace for beauty and wellness spaces — book chairs, treatment rooms, and salon or clinic space by the hour, day, or month.";
  return [
    { title },
    { name: "description", content: description },
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
          "B2B marketplace for beauty and wellness spaces connecting business hosts with professional tenants across the UK.",
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
        <meta name="robots" content="index, follow" />
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

export default function Root() {
  return (
    <ChatProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <NotificationProvider>
            <QueryClientProvider client={queryClient}>
              <ToastContainer position="top-right" autoClose={4000} />
              <Outlet />
            </QueryClientProvider>
          </NotificationProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ChatProvider>
  );
}
