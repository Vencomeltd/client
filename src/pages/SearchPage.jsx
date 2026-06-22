﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Camera,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  Map,
  Monitor,
  SlidersHorizontal,
  UserCheck,
  Users,
  Wifi,
  Wind,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import Footer from "../components/Footer";

const DURATION_OPTIONS = ["Any", "Hourly", "Daily", "Weekly", "Monthly", "Annual"];

const DURATION_VALUE_MAP = {
  Any: "Any",
  Hourly: "hour",
  Daily: "day",
  Weekly: "week",
  Monthly: "month",
  Annual: "year",
};

const AMENITY_OPTIONS = [
  { label: "Wifi", icon: Wifi },
  { label: "Parking", icon: Car },
  { label: "AV Equipment", icon: Monitor },
  { label: "Kitchen", icon: Coffee },
  { label: "24/7 Access", icon: Clock3 },
  { label: "Reception", icon: UserCheck },
  { label: "Air Con", icon: Wind },
  { label: "Disabled Access", icon: Accessibility },
  { label: "CCTV", icon: Camera },
  { label: "Meeting Rooms", icon: Users },
];

const SORT_OPTIONS = [
  "Relevance",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
  "Top Rated",
];

const getPaginationItems = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsRef = useRef(null);

  const initialCity = searchParams.get("city") || searchParams.get("location") || "";
  const initialCategory = searchParams.get("category") || "";

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minCapacity, setMinCapacity] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState("Relevance");
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCity) queryParams.set("location", selectedCity);
      if (selectedCategory) queryParams.set("category", selectedCategory);
      if (selectedSubcategory) queryParams.set("subcategory", selectedSubcategory);
      if (minPrice > 0) queryParams.set("minPrice", minPrice);
      if (maxPrice < 10000) queryParams.set("maxPrice", maxPrice);

      const url = queryParams.toString()
        ? `${import.meta.env.VITE_API_URL}/properties/search?${queryParams.toString()}`
        : `${import.meta.env.VITE_API_URL}/properties?limit=20`;

      const response = await fetch(url);
      const data = await response.json();
      let results = data.properties || [];

      if (selectedDuration && selectedDuration !== "any") {
        results = results.filter((listing) => {
          const val = listing.pricing?.[selectedDuration];
          if (!val) return false;
          if (typeof val === "object") return val.enabled && val.price;
          return val > 0;
        });
      }

      if (minCapacity > 1) {
        results = results.filter((listing) => {
          const cap = listing.features?.capacity || listing.features?.maxGuests || 0;
          return cap >= minCapacity;
        });
      }

      if (selectedAmenities.length > 0) {
        results = results.filter((listing) => {
          const amenities = listing.features?.amenities || [];
          return selectedAmenities.every((amenity) => amenities.includes(amenity));
        });
      }

      setListings(results);
      setTotal(results.length);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nextCity = searchParams.get("city") || searchParams.get("location") || "";
    const nextCategory = searchParams.get("category") || "";
    setSelectedCity(nextCity);
    setSelectedCategory(nextCategory);
    setSelectedSubcategory("");
    setSelectedDuration("");
    setMinPrice(0);
    setMaxPrice(10000);
    setMinCapacity(1);
    setSelectedAmenities([]);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
    setCurrentPage(1);
  }, [
    selectedCity,
    selectedCategory,
    selectedSubcategory,
    selectedDuration,
    minPrice,
    maxPrice,
    minCapacity,
    selectedAmenities,
  ]);

  const filteredResults = useMemo(() => {
    const getListingPrice = (listing) =>
      Number(
        listing.pricing?.hourly ??
          listing.pricing?.hourlyPrice ??
          listing.pricing?.daily ??
          listing.pricing?.weekdayPrice ??
          0
      );

    const sorted = [...listings].sort((a, b) => {
      if (sortBy === "Price: Low to High") return getListingPrice(a) - getListingPrice(b);
      if (sortBy === "Price: High to Low") return getListingPrice(b) - getListingPrice(a);
      if (sortBy === "Top Rated") return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === "Newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });

    return sorted;
  }, [
    listings,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / 9));
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * 9,
    currentPage * 9
  );
  const paginationItems = getPaginationItems(currentPage, totalPages);

  const activeTags = [
    ...(selectedCity ? [{ key: "city", label: selectedCity }] : []),
    ...(selectedCategory
      ? [{
          key: `category-${selectedCategory}`,
          label: categories.find((c) => c._id === selectedCategory)?.name || selectedCategory,
        }]
      : []),
    ...(selectedSubcategory
      ? [{ key: `subcategory-${selectedSubcategory}`, label: selectedSubcategory }]
      : []),
    ...(selectedDuration
      ? [{ key: "duration", label: selectedDuration }]
      : []),
    ...(minPrice !== 0 || maxPrice !== 10000
      ? [
          {
            key: "price",
            label: `£${minPrice.toLocaleString()} - £${maxPrice.toLocaleString()}${
              maxPrice >= 10000 ? "+" : ""
            }`,
          },
        ]
      : []),
    ...(minCapacity > 1
      ? [{ key: "capacity", label: `${minCapacity}+ capacity` }]
      : []),
    ...selectedAmenities.map((amenity) => ({
      key: `amenity-${amenity}`,
      label: amenity,
    })),
  ];

  const filters = {
    selectedCity,
    selectedCategory,
    selectedSubcategory,
    selectedDuration,
    minPrice,
    maxPrice,
    minCapacity,
    selectedAmenities,
    sortBy,
    categories,
  };

  const handleFilterChange = (type, value) => {
    if (type === "toggle-category") {
      setSelectedCategory((current) => {
        const next = current === value ? "" : value;
        setSelectedSubcategory("");

        const params = new URLSearchParams(searchParams);
        if (next) {
          params.set("category", next);
        } else {
          params.delete("category");
        }
        params.delete("subcategory");
        setSearchParams(params);

        return next;
      });
      return;
    }
    if (type === "toggle-subcategory") {
      setSelectedSubcategory((current) => {
        const next = current === value ? "" : value;

        const params = new URLSearchParams(searchParams);
        if (next) {
          params.set("subcategory", next);
        } else {
          params.delete("subcategory");
        }
        setSearchParams(params);

        return next;
      });
      return;
    }

    if (type === "set-duration") {
      setSelectedDuration(value);
      return;
    }

    if (type === "set-min-price") {
      const nextMin = clamp(Number(value) || 0, 0, maxPrice);
      setMinPrice(nextMin);
      return;
    }

    if (type === "set-max-price") {
      const nextMax = clamp(Number(value) || 0, minPrice, 10000);
      setMaxPrice(nextMax);
      return;
    }

    if (type === "set-min-capacity") {
      setMinCapacity(clamp(Number(value) || 1, 1, 200));
      return;
    }

    if (type === "toggle-amenity") {
      setSelectedAmenities((current) =>
        current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value]
      );
      return;
    }

    if (type === "set-sort") {
      setSortBy(value);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedDuration("");
    setMinPrice(0);
    setMaxPrice(10000);
    setMinCapacity(1);
    setSelectedAmenities([]);
  };

  const handleApplyFilters = () => {
    fetchListings();
    setIsDrawerOpen(false);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const removeActiveTag = (key) => {
    if (key === "city") {
      setSelectedCity("");
      return;
    }

    if (key === "duration") {
      setSelectedDuration("");
      return;
    }

    if (key === "price") {
      setMinPrice(0);
      setMaxPrice(10000);
      return;
    }

    if (key === "capacity") {
      setMinCapacity(1);
      return;
    }

    if (key.startsWith("category-")) {
      setSelectedCategory("");
      return;
    }

    if (key.startsWith("amenity-")) {
      const value = key.replace("amenity-", "");
      setSelectedAmenities((current) => current.filter((item) => item !== value));
    }
  };

  const handleSave = (id) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <>
      <style>{`
        .vencome-range {
          -webkit-appearance: none;
          appearance: none;
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 20px;
          transform: translateY(-50%);
          background: transparent;
          pointer-events: none;
        }

        .vencome-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: white;
          border: 2px solid #0A1628;
          pointer-events: auto;
          cursor: pointer;
        }

        .vencome-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: white;
          border: 2px solid #0A1628;
          pointer-events: auto;
          cursor: pointer;
        }

        .vencome-range::-moz-range-track {
          background: transparent;
        }
      `}</style>

      <Navbar />

      <div className="min-h-screen overflow-x-hidden bg-[#F8F6F0] pb-24 pt-28 md:pb-0 md:pt-32">
        <div
          ref={resultsRef}
          className="mx-auto flex max-w-[1440px] min-w-0 items-start gap-4 px-4 py-6 md:gap-8 md:px-6"
        >
          <div className="hidden w-[300px] shrink-0 md:block">
            <div className="sticky top-[140px]">
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onClear={clearFilters}
                onApply={handleApplyFilters}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-[#0A1628]">
                  {total} spaces found
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <AnimatePresence>
                    {activeTags.map((tag) => (
                      <motion.button
                        key={tag.key}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        onClick={() => removeActiveTag(tag.key)}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[rgba(10,22,40,0.06)] px-3 py-1.5 text-xs font-medium text-[#0A1628]"
                      >
                        <span className="break-words">{tag.label}</span>
                        <X size={12} />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="min-h-[44px] flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none sm:flex-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowMap((current) => !current)}
                  className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition sm:flex-none ${
                    showMap
                      ? "border-[#0A1628] bg-[#0A1628] text-white"
                      : "border-[#E5E7EB] bg-white text-[#111827]"
                  }`}
                >
                  <Map size={15} />
                  <span>{showMap ? "Hide Map" : "Show Map"}</span>
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {showMap ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 400 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden rounded-2xl border border-[#E5E7EB]"
                >
                  <div className="flex h-full flex-col items-center justify-center bg-[#0A1628] px-6 text-center text-white">
                    <Map size={34} className="mb-3 text-[#305CDE]" />
                    <h3 className="text-xl font-semibold">Interactive Map</h3>
                    <p className="mt-2 text-sm text-white/70">
                      Google Maps integration — coming in backend phase
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PropertyCard isLoading />
                  </motion.div>
                ))}
              </motion.div>
            ) : filteredResults.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[420px] flex-col items-center justify-center rounded-[24px] border border-[#E5E7EB] bg-white px-6 text-center"
              >
                <div style={{ textAlign: "center", padding: "80px 0", color: "#6B7280" }}>
                  <p style={{ fontSize: "18px", marginBottom: "8px" }}>No spaces found</p>
                  <p style={{ fontSize: "14px" }}>
                    Try adjusting your filters or search a different location
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={JSON.stringify(paginatedResults.map((result) => result._id))}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3"
                >
                  {paginatedResults.map((result, index) => (
                    <motion.div
                      key={result._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PropertyCard
                        id={result._id}
                        image={result.coverImage}
                        title={result.title}
                        location={`${result.location?.city || ""}, ${
                          result.location?.country || ""
                        }`}
                        category={result.category?.name || ""}
                        price={
                          result.pricing?.hourly ??
                          result.pricing?.hourlyPrice ??
                          result.pricing?.daily ??
                          result.pricing?.weekdayPrice ??
                          0
                        }
                        priceUnit={
                          result.pricing?.hourly || result.pricing?.hourlyPrice
                            ? "hr"
                            : result.pricing?.daily || result.pricing?.weekdayPrice
                            ? "day"
                            : "POA"
                        }
                        rating={result.rating || 0}
                        reviewCount={result.reviewNumber || result.reviewCount || 0}
                        isSaved={savedIds.includes(result._id)}
                        onSave={handleSave}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">← Prev</span>
                    <span className="sm:hidden">
                      <ChevronLeft size={16} />
                    </span>
                  </button>

                  {paginationItems.map((item, index) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="hidden h-10 w-10 items-center justify-center text-sm text-[#6B7280] sm:flex"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`hidden h-10 w-10 items-center justify-center rounded-lg text-sm transition sm:flex ${
                          currentPage === item
                            ? "bg-[#0A1628] text-white"
                            : "border border-[#E5E7EB] bg-white text-[#111827]"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">Next →</span>
                    <span className="sm:hidden">
                      <ChevronRight size={16} />
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-5 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#305CDE] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] md:hidden"
      >
        <SlidersHorizontal size={16} />
        <span>Filters & Sort</span>
      </button>

      <AnimatePresence>
        {isDrawerOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-[199] bg-black/40 md:hidden"
              aria-label="Close filters"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[200] max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-white px-4 pb-8 pt-5 md:hidden"
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#E5E7EB]" />
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onClear={clearFilters}
                onApply={handleApplyFilters}
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function FilterSidebar({ filters, onChange, onClear, onApply }) {
  const {
    selectedCategory,
    selectedSubcategory,
    selectedDuration,
    minPrice,
    maxPrice,
    minCapacity,
    selectedAmenities,
    categories,
  } = filters;

  const minThumbPercent = (minPrice / 10000) * 100;
  const maxThumbPercent = (maxPrice / 10000) * 100;

  return (
    <div className="flex flex-col gap-7 rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#0A1628]">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="border-none bg-transparent text-[13px] font-medium text-[#305CDE]"
        >
          Clear all
        </button>
      </div>

      <div className="border-t border-[#E5E7EB] pt-7">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[1.5px] text-[#6B7280]">
          Space Type
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = selectedCategory === category._id;
            return (
              <button
                key={category._id}
                type="button"
                onClick={() => onChange("toggle-category", category._id)}
                className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
                  selected
                    ? "border-[#0A1628] bg-[#0A1628] text-white"
                    : "border-[#E5E7EB] bg-white text-[#111827]"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {selectedCategory ? (() => {
          const activeCategory = categories.find((c) => c._id === selectedCategory);
          const subs = activeCategory?.subcategories || [];
          if (subs.length === 0) return null;

          return (
            <div className="mt-4 border-t border-[#F3F4F6] pt-4">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[1.2px] text-[#9CA3AF]">
                Subcategory
              </p>
              <div className="flex flex-wrap gap-2">
                {subs.map((sub) => {
                  const subSelected = selectedSubcategory === sub.name;
                  return (
                    <button
                      key={sub._id || sub.name}
                      type="button"
                      onClick={() => onChange("toggle-subcategory", sub.name)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                        subSelected
                          ? "border-[#305CDE] bg-[#305CDE] text-white"
                          : "border-[#E5E7EB] bg-white text-[#6B7280]"
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })() : null}
      </div>

      <div className="border-t border-[#E5E7EB] pt-7">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[1.5px] text-[#6B7280]">
          Duration Type
        </p>
        <div>
          {DURATION_OPTIONS.map((option) => {
            const durationValue = option === "Any" ? "" : option.toLowerCase();
            const selected = selectedDuration === durationValue;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange("set-duration", durationValue)}
                className="flex w-full items-center justify-between border-b border-[#F3F4F6] py-2.5 text-left last:border-b-0"
              >
                <span className="text-[14px] text-[#111827]">{option}</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selected ? "border-[#0A1628]" : "border-[#E5E7EB]"
                  }`}
                >
                  {selected ? (
                    <span className="h-[10px] w-[10px] rounded-full bg-[#0A1628]" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] pt-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-[#111827]">Price Range</p>
          <span className="text-[13px] text-[#6B7280]">
            £{minPrice.toLocaleString()} - £{maxPrice.toLocaleString()}
            {maxPrice >= 10000 ? "+" : ""}
          </span>
        </div>

        <div className="relative h-8">
          <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-[#E5E7EB]" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#0A1628]"
            style={{
              left: `${minThumbPercent}%`,
              right: `${100 - maxThumbPercent}%`,
            }}
          />
          <input
            type="range"
            min="0"
            max="10000"
            step="10"
            value={minPrice}
            onChange={(event) =>
              onChange("set-min-price", Math.min(Number(event.target.value), maxPrice))
            }
            className="vencome-range"
          />
          <input
            type="range"
            min="0"
            max="10000"
            step="10"
            value={maxPrice}
            onChange={(event) =>
              onChange("set-max-price", Math.max(Number(event.target.value), minPrice))
            }
            className="vencome-range"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="number"
            min="0"
            max={maxPrice}
            value={minPrice}
            onChange={(event) => onChange("set-min-price", event.target.value)}
            className="w-20 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[13px] outline-none"
          />
          <span className="text-[#6B7280]">-</span>
          <input
            type="number"
            min={minPrice}
            max="10000"
            value={maxPrice}
            onChange={(event) => onChange("set-max-price", event.target.value)}
            className="w-20 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[13px] outline-none"
          />
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] pt-7">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[1.5px] text-[#6B7280]">
          Capacity
        </p>
        <p className="mb-3 text-[14px] font-medium text-[#111827]">
          Minimum Capacity
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange("set-min-capacity", minCapacity - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628]"
          >
            -
          </button>
          <span className="min-w-[2ch] text-center text-lg font-semibold text-[#111827]">
            {minCapacity}
          </span>
          <button
            type="button"
            onClick={() => onChange("set-min-capacity", minCapacity + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628]"
          >
            +
          </button>
        </div>
        <p className="mt-2 text-[12px] text-[#6B7280]">people / workstations</p>
      </div>

      <div className="border-t border-[#E5E7EB] pt-7">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[1.5px] text-[#6B7280]">
          Amenities
        </p>
        <div>
          {AMENITY_OPTIONS.map(({ label, icon: Icon }) => {
            const selected = selectedAmenities.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange("toggle-amenity", label)}
                className="flex w-full items-center gap-3 py-2 text-left"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-[4px] border-2 ${
                    selected
                      ? "border-[#0A1628] bg-[#0A1628] text-white"
                      : "border-[#E5E7EB] bg-white text-transparent"
                  }`}
                >
                  <Check size={12} />
                </span>
                <Icon size={16} className="text-[#6B7280]" />
                <span className="text-[14px] text-[#111827]">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="w-full rounded-[10px] bg-[#305CDE] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-[#305CDE]"
      >
        Apply
      </button>
    </div>
  );
}
