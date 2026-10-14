import React from "react";
import { Link, useLoaderData } from "react-router-dom";
import { data, redirect } from "react-router";
import PropertyCard from "../components/PropertyCard";
import Footer from "../components/Footer";
import NotFound from "./NotFound";

// SEO landing pages: /uk, /uk/:city, /uk/:city/:service and /:serviceSlug
// (spec in the vault, item 29). Which pages exist and whether they're
// indexable is decided server-side by GET /api/landing.

const SITE = "https://www.vencome.com";

export async function loader({ request }) {
  const url = new URL(request.url);
  const pageParam = url.searchParams.get("page");
  // ?page=1 is the same page as the clean URL -- keep one canonical form.
  if (pageParam === "1") return redirect(url.pathname, 301);

  const query = new URLSearchParams({ path: url.pathname });
  if (pageParam !== null) query.set("page", pageParam);

  // Same rule as PropertyDetails: a failed API call must never render as a
  // 200 "not found" (soft 404). Retry once, 404 only when the API says so.
  let res = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetch(`${import.meta.env.VITE_API_URL}/landing?${query}`);
      if (res.ok || res.status === 404) break;
    } catch {
      res = null;
    }
  }
  if (res?.status === 404) return data({ notFound: true }, { status: 404 });
  if (!res?.ok) return data({ unavailable: true }, { status: 503, headers: { "Retry-After": "120" } });
  return res.json();
}

const withArticle = (name) => (/^United /.test(name) ? `the ${name}` : name);

function headingFor(page) {
  if (page.type === "country") return `Commercial Spaces to Rent in ${withArticle(page.countryName)}`;
  if (page.type === "city") return `Commercial Spaces to Rent in ${page.cityName}`;
  if (page.type === "city_service") return `${page.serviceName} to Rent in ${page.cityName}`;
  return `${page.serviceName} to Rent`;
}

function placeFor(page) {
  return page.cityName || (page.countryName ? withArticle(page.countryName) : "");
}

// Service names mix singular and plural ("Chairs", "Beauty Treatment Room"),
// so copy uses them as a label rather than inside a counted phrase.
function summaryFor(page) {
  const label = page.serviceName || "Commercial spaces";
  const place = placeFor(page);
  const n = page.listingCount;
  return `${label}${place ? ` in ${place}` : ""}: ${n} ${n === 1 ? "listing" : "listings"} available to rent on VenCome.`;
}

function childHeadingFor(page) {
  if (page.type === "country" || page.type === "service") return "Browse by city";
  if (page.type === "city") return `Spaces in ${page.cityName}`;
  return `More spaces in ${page.cityName}`;
}

// Built only from real data so every answer is true for this page.
function faqsFor(page, children) {
  const label = page.serviceName || "commercial space";
  const place = placeFor(page);
  const n = page.listingCount;
  const faqs = [
    {
      q: `How many ${label} listings are there${place ? ` in ${place}` : " on VenCome"}?`,
      a: `There ${n === 1 ? "is" : "are"} currently ${n} ${n === 1 ? "listing" : "listings"} on VenCome${place ? ` in ${place}` : ""}. New spaces are added as hosts join.`,
    },
  ];
  if (children.length > 0) {
    const names = children.slice(0, 8).map((c) => c.name).join(", ");
    const q =
      page.type === "country" ? "Which cities can I rent space in?"
      : page.type === "service" ? `Which cities have ${label} listings?`
      : page.type === "city" ? `What types of space can I rent in ${place}?`
      : `What other spaces can I rent in ${place}?`;
    faqs.push({ q, a: `${names}${children.length > 8 ? ", and more" : ""}.` });
  }
  faqs.push({
    q: "How does booking work?",
    a: "Choose a space and your dates, then book instantly where the host offers Instant Book, or send a booking request for the host to approve. Payments are processed securely through Stripe and held until after your booking.",
  });
  return faqs;
}

export function meta({ data: d }) {
  if (!d?.page) {
    return [{ title: d?.notFound ? "Page not found | VenCome" : "VenCome" }, { name: "robots", content: "noindex" }];
  }
  const { page, pagination, children } = d;
  const pageSuffix = pagination.page > 1 ? ` – Page ${pagination.page}` : "";
  const title = `${headingFor(page)}${pageSuffix} | VenCome`;
  const description = (page.intro || summaryFor(page)).slice(0, 160);
  // Spec rule 7: each paginated page is self-canonical.
  const url = `${SITE}${page.path}${pagination.page > 1 ? `?page=${pagination.page}` : ""}`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { tagName: "link", rel: "canonical", href: url },
    { name: "robots", content: page.indexable ? "index, follow" : "noindex, follow" },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: page.breadcrumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${SITE}${c.path === "/" ? "" : c.path}`,
        })),
      },
    },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqsFor(page, children).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    },
  ];
}

export default function LandingPage() {
  const d = useLoaderData();
  if (d?.notFound) return <NotFound />;
  if (!d?.page) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-lg text-gray-800 mb-2">This page is temporarily unavailable.</p>
        <p className="text-sm text-gray-500">Please try again in a moment.</p>
      </div>
    );
  }

  const { page, listings, children, pagination } = d;
  const faqs = faqsFor(page, children);
  const pageHref = (n) => (n === 1 ? page.path : `${page.path}?page=${n}`);

  return (
    <div className="min-h-screen bg-white">
      <div className="container w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            {page.breadcrumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden="true">›</span>}
                {i === page.breadcrumbs.length - 1 ? (
                  <span aria-current="page" className="text-gray-800">{c.name}</span>
                ) : (
                  <Link to={c.path} className="hover:text-[#0A1628]">{c.name}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">{headingFor(page)}</h1>
        <p className="text-gray-600 max-w-3xl mb-8 whitespace-pre-line">{page.intro || summaryFor(page)}</p>

        {children.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">{childHeadingFor(page)}</h2>
            <ul className="flex flex-wrap gap-2">
              {children.map((c) => (
                <li key={c.path}>
                  <Link
                    to={c.path}
                    className="inline-block rounded-full border border-[#E5E7EB] px-3 py-1.5 text-sm text-gray-700 hover:border-[#305CDE] hover:text-[#305CDE]"
                  >
                    {c.name} <span className="text-gray-400">({c.listingCount})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((property) => (
              <PropertyCard
                key={property._id}
                id={property._id}
                image={property.coverImage}
                title={property.title}
                location={`${property.location?.city || ""}, ${property.location?.country || ""}`}
                category={property.category?.name}
                property={property}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 py-8">No spaces are listed here yet. Check back soon as new hosts join.</p>
        )}

        {pagination.totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm">
            {pagination.page > 1 && (
              <Link to={pageHref(pagination.page - 1)} className="text-[#305CDE] hover:underline">← Previous</Link>
            )}
            <span className="text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
            {pagination.page < pagination.totalPages && (
              <Link to={pageHref(pagination.page + 1)} className="text-[#305CDE] hover:underline">Next →</Link>
            )}
          </nav>
        )}

        <section className="mt-14 max-w-3xl">
          <h2 className="text-xl font-bold text-[#0A1628] mb-4">Frequently asked questions</h2>
          <dl className="space-y-5">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-gray-800">{f.q}</dt>
                <dd className="text-gray-600 mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <Footer />
    </div>
  );
}
