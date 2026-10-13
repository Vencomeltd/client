import React, { useState, useEffect } from "react";
import { useParams, useLoaderData, Link } from "react-router-dom";
import { data } from "react-router";
import { Sparkles, Building2 } from "lucide-react";
import PropertyCard from "../components/PropertyCard";
import VencomeLoader from "../components/Loader";

// "islington" -> "Islington", "co-working-flex" -> "Co Working Flex" --
// best-effort display name when there are zero matching listings yet (so
// there's no real property to read the host's actual capitalization from).
const titleCaseSlug = (slug) =>
  (slug || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

async function fetchServiceLocation(subcategorySlug, locationSlug) {
  const subRes = await fetch(`${import.meta.env.VITE_API_URL}/categories/subcategory/${subcategorySlug}`);
  if (!subRes.ok) return { category: null, subcategory: null, properties: [], unavailable: subRes.status !== 404 };
  const subData = await subRes.json();

  const propsRes = await fetch(
    `${import.meta.env.VITE_API_URL}/properties/by-service-location?subcategory=${encodeURIComponent(
      subData.subcategory?.name || ""
    )}&locationSlug=${encodeURIComponent(locationSlug)}`
  );
  const propsData = propsRes.ok ? await propsRes.json() : { properties: [] };

  return {
    category: subData.category || null,
    subcategory: subData.subcategory || null,
    properties: propsData.properties || [],
  };
}

export async function loader({ params }) {
  // Any two-segment URL lands here, so an unknown service (e.g.
  // /zzz-fake/nowhere) must answer a real 404, not a 200 page.
  let result;
  try {
    result = await fetchServiceLocation(params.subcategorySlug, params.locationSlug);
  } catch {
    result = { category: null, subcategory: null, properties: [], unavailable: true };
  }
  // API trouble is temporary (503, retry later) -- only a confirmed-unknown
  // service is a 404.
  if (result.unavailable) return data(result, { status: 503, headers: { "Retry-After": "120" } });
  if (!result.subcategory) return data(result, { status: 404 });
  return result;
}

export function shouldRevalidate({ currentParams, nextParams, defaultShouldRevalidate }) {
  if (
    currentParams.subcategorySlug === nextParams.subcategorySlug &&
    currentParams.locationSlug === nextParams.locationSlug
  ) {
    return false;
  }
  return defaultShouldRevalidate;
}

export function meta({ data, params }) {
  const subcategory = data?.subcategory;
  const locationName =
    data?.properties?.[0]?.location?.neighborhood || titleCaseSlug(params.locationSlug);
  if (!subcategory) return [{ title: "Page not found | VenCome" }, { name: "robots", content: "noindex" }];
  const title = `${subcategory.name} in ${locationName} | VenCome`;
  const description =
    subcategory.description ||
    `Browse ${subcategory.name} spaces available to book in ${locationName} on VenCome.`;
  const url = `https://www.vencome.com/${params.subcategorySlug}/${params.locationSlug}`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { tagName: "link", rel: "canonical", href: url },
    // No matching listings: still useful to visitors, but thin -- keep it
    // out of the index while letting link equity flow.
    ...((data?.properties?.length || 0) === 0 ? [{ name: "robots", content: "noindex, follow" }] : []),
  ];
}

const ServiceLocationPage = () => {
  const { subcategorySlug, locationSlug } = useParams();
  const loaderData = useLoaderData();
  const [category, setCategory] = useState(loaderData?.category || null);
  const [subcategory, setSubcategory] = useState(loaderData?.subcategory || null);
  const [properties, setProperties] = useState(loaderData?.properties || []);
  const [loading, setLoading] = useState(!loaderData?.subcategory);
  const [prospectEmail, setProspectEmail] = useState("");
  const [prospectStatus, setProspectStatus] = useState("idle"); // idle | submitting | success | error
  const [prospectError, setProspectError] = useState("");

  useEffect(() => {
    // Same reasoning as CategoryPage.jsx: the SSR loader already fetched
    // this exact page server-side, so only hit the API again here if that
    // failed to provide a subcategory.
    if (loaderData?.subcategory) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchServiceLocation(subcategorySlug, locationSlug);
        setCategory(data.category);
        setSubcategory(data.subcategory);
        setProperties(data.properties);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subcategorySlug, locationSlug, loaderData]);

  if (loading) {
    return <VencomeLoader />;
  }

  if (!subcategory) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center text-gray-600">
        Service not found.
      </div>
    );
  }

  const locationName = properties[0]?.location?.neighborhood || titleCaseSlug(locationSlug);
  const heroImage = subcategory.image || category?.image;

  const handleProspectSubmit = async (event) => {
    event.preventDefault();
    if (!prospectEmail.trim()) {
      setProspectError("Please enter your email");
      return;
    }
    setProspectStatus("submitting");
    setProspectError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/prospect-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: prospectEmail.trim(),
          location: locationName,
          category: category?.name,
          subcategory: subcategory.name,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProspectError(data.error || "Something went wrong");
        setProspectStatus("error");
        return;
      }
      setProspectStatus("success");
    } catch {
      setProspectError("Network error. Please try again.");
      setProspectStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {heroImage && (
        <div className="relative h-[220px] w-full overflow-hidden sm:h-[280px] lg:h-[340px]">
          <img
            src={heroImage}
            alt={subcategory.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {subcategory.name} in {locationName}
            </h1>
          </div>
        </div>
      )}

      <div className="container w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          {!heroImage && (
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              {subcategory.name} in {locationName}
            </h1>
          )}
          {subcategory.description && (
            <p className="text-lg text-gray-600 max-w-3xl">{subcategory.description}</p>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
            <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F7FF] text-[#305CDE]">
              <Sparkles size={28} />
            </span>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#305CDE]">
              Coming Soon
            </p>
            <h2 className="mb-4 text-[clamp(22px,4vw,30px)] font-extrabold text-[#0A1628]">
              {subcategory.name} in {locationName} is launching soon
            </h2>
            <p className="mb-8 text-[15px] leading-7 text-[#6B7280]">
              We're onboarding hosts in this area right now. Browsing and
              booking will open shortly — but you can list your space today
              and be ready the moment it goes live.
            </p>
            <Link
              to="/create-space"
              className="inline-flex items-center gap-2 rounded-full bg-[#305CDE] px-8 py-4 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(48,92,222,0.35)] transition hover:bg-[#254FC7]"
            >
              <Building2 size={18} />
              Start Listing Your Space
            </Link>

            {prospectStatus === "success" ? (
              <p className="mt-6 text-[14px] font-semibold text-[#16A34A]">
                Thanks! We'll email you the moment {subcategory.name} opens in {locationName}.
              </p>
            ) : (
              <form onSubmit={handleProspectSubmit} className="mt-6 w-full max-w-sm">
                <p className="mb-3 text-[13px] text-[#6B7280]">
                  Not ready to list yet? Leave your email and we'll notify you when we launch here.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={prospectEmail}
                    onChange={(e) => {
                      setProspectEmail(e.target.value);
                      setProspectError("");
                    }}
                    placeholder="you@example.com"
                    className="min-h-[44px] flex-1 rounded-full border border-[#E5E7EB] px-4 text-[14px] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={prospectStatus === "submitting"}
                    className="min-h-[44px] rounded-full bg-[#0A1628] px-5 text-[14px] font-semibold text-white disabled:opacity-60"
                  >
                    {prospectStatus === "submitting" ? "..." : "Notify me"}
                  </button>
                </div>
                {prospectError ? (
                  <p className="mt-2 text-[12px] text-[#DC2626]">{prospectError}</p>
                ) : null}
              </form>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                id={property._id}
                image={property.coverImage}
                title={property.title}
                location={`${property.location?.city || ""}, ${property.location?.country || ""}`}
                category={property.category?.name || category?.name}
                property={property}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceLocationPage;
