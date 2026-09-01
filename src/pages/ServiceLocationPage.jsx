import React, { useState, useEffect } from "react";
import { useParams, useLoaderData, Link } from "react-router-dom";
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
  if (!subRes.ok) return { category: null, subcategory: null, properties: [] };
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
  return fetchServiceLocation(params.subcategorySlug, params.locationSlug);
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
  if (!subcategory) return [{ title: "Spaces | VenCome" }];
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
  ];
}

const ServiceLocationPage = () => {
  const { subcategorySlug, locationSlug } = useParams();
  const loaderData = useLoaderData();
  const [category, setCategory] = useState(loaderData?.category || null);
  const [subcategory, setSubcategory] = useState(loaderData?.subcategory || null);
  const [properties, setProperties] = useState(loaderData?.properties || []);
  const [loading, setLoading] = useState(!loaderData?.subcategory);

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

  return (
    <div className="min-h-screen bg-gray-50">
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
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
