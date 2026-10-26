import { data } from "react-router";

// Public pages (home, category, landing, property, blog) render the same
// HTML/data for every visitor -- sign-in state lives in the browser -- so
// Vercel's edge can answer them from a nearby cache instead of a round-trip
// to the function in iad1 and on to the Render API on every click.
// Fresh for 60 s, then served stale for up to 5 min while the edge refreshes
// it in the background. max-age=0 keeps browsers asking the edge each time.
const EDGE_CACHE_CONTROL = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

// Loaders wrap only successful payloads with this -- never 404/503 or
// fallback data after a failed API call -- so errors are never cached.
// Each route also exports headers({ loaderHeaders }) => loaderHeaders so the
// header reaches both the HTML and the /<page>.data navigation response.
export function edgeCached(payload) {
  return data(payload, { headers: { "Cache-Control": EDGE_CACHE_CONTROL } });
}
