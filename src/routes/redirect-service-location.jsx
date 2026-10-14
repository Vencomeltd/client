import { useLoaderData } from "react-router-dom";
import { data, redirect } from "react-router";
import NotFound from "../pages/NotFound";

// Old service+location URLs (e.g. /hair-studio/islington-london-) moved to
// the SEO landing pages (/uk/london/hair-studio). The server works out the
// new home from the listings the old page showed; this just 301s there.
export async function loader({ params, request }) {
  const query = new URLSearchParams({ service: params.subcategorySlug, location: params.locationSlug });
  // Same rule as the other loaders: never turn an API failure into a 404.
  let res = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetch(`${import.meta.env.VITE_API_URL}/landing/legacy?${query}`);
      if (res.ok || res.status === 404) break;
    } catch {
      res = null;
    }
  }
  if (res?.status === 404) return data({ notFound: true }, { status: 404 });
  if (!res?.ok) return data({ unavailable: true }, { status: 503, headers: { "Retry-After": "120" } });
  const { path } = await res.json();
  return redirect(`${path}${new URL(request.url).search}`, 301);
}

export function meta({ data: d }) {
  return [{ title: d?.notFound ? "Page not found | VenCome" : "VenCome" }, { name: "robots", content: "noindex" }];
}

export default function RedirectServiceLocation() {
  const d = useLoaderData();
  if (d?.notFound) return <NotFound />;
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <p className="text-lg text-gray-800 mb-2">This page is temporarily unavailable.</p>
      <p className="text-sm text-gray-500">Please try again in a moment.</p>
    </div>
  );
}
