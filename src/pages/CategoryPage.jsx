import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData, Link } from "react-router-dom";
import { redirect } from "react-router";
import { Sparkles, Building2 } from "lucide-react";
import { apiFetch } from "../utils/api";
import PropertyCard from "../components/PropertyCard";
import VencomeLoader from "../components/Loader";
import TagList from "../components/TagList";

export async function loader({ params }) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/${params.id}`);
  if (!res.ok) return { category: null, properties: [] };
  const data = await res.json();
  const category = data.category || null;
  // Canonicalize old ObjectId links to the slug URL once one exists, so
  // search engines index a single URL per category instead of two.
  if (category?.slug && params.id !== category.slug) {
    return redirect(`/category/${category.slug}`, 301);
  }
  return { category, properties: data.properties || [] };
}

// Skip refetching when returning to the *same* category (e.g. navigating
// back after briefly leaving) -- still fetches fresh data whenever the id
// actually changes, i.e. a real switch to a different category.
export function shouldRevalidate({ currentParams, nextParams, defaultShouldRevalidate }) {
  if (currentParams.id === nextParams.id) return false;
  return defaultShouldRevalidate;
}

export function meta({ data }) {
  const category = data?.category;
  if (!category) return [{ title: "Category | VenCome" }];
  const title = `${category.name} Spaces | VenCome`;
  const description =
    category.description || `Browse ${category.name} spaces available to book on VenCome.`;
  const url = `https://www.vencome.com/category/${category.slug || category._id}`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { tagName: "link", rel: "canonical", href: url },
  ];
}

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const [category, setCategory] = useState(loaderData?.category || null);
  const [properties, setProperties] = useState(loaderData?.properties || []);
  const [loading, setLoading] = useState(!loaderData?.category);
  const [error, setError] = useState("");

  useEffect(() => {
    // The SSR loader already fetched this exact category server-side --
    // refetching it again here on mount was forcing loading back to true
    // and flashing the spinner even though the data was already correct,
    // adding a whole redundant network round-trip before the page felt
    // usable. Only hit the API here as a fallback when the loader didn't
    // provide a category (e.g. it failed).
    if (loaderData?.category) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const catData = await apiFetch({ endpoint: `/categories/${id}` });
        setCategory(catData.category);
        setProperties(catData.properties);
        setError("");
      } catch (err) {
        setError("Failed to load category");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, loaderData]);

  if (loading) {
    return <VencomeLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {category.image && (
        <div className="relative h-[220px] w-full overflow-hidden sm:h-[280px] lg:h-[340px]">
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {category.name}
            </h1>
          </div>
        </div>
      )}

      <div className="container w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        <div className="mb-8">
          {!category.image && (
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              {category.name}
            </h1>
          )}
          {category.description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
            <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F7FF] text-[#305CDE]">
              <Sparkles size={28} />
            </span>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#305CDE]">
              Coming Soon
            </p>
            <h2 className="mb-4 text-[clamp(22px,4vw,30px)] font-extrabold text-[#0A1628]">
              {category.name} is launching soon
            </h2>
            <p className="mb-8 text-[15px] leading-7 text-[#6B7280]">
              We're onboarding hosts in this category right now. Browsing and
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
                category={property.category?.name || category.name}
                property={property}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
