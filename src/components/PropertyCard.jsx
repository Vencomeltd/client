﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MapPin, Star } from "lucide-react";
import { getLowestWeeklyRate } from "../utils/dayPricing";

const BADGE_STYLES = {
  Featured: "bg-[#305CDE] text-white",
  Verified: "bg-[#0A1628] text-white",
  Popular: "bg-[#111827] text-[#305CDE]",
  New: "border border-[#E5E7EB] bg-white text-[#111827]",
};

const formatPrice = (value) =>
  new Intl.NumberFormat("en-GB").format(Number(value) || 0);

const getListingPrice = (listing) => {
  const p = listing?.pricing;
  if (!p) return { price: "POA", unit: "", fromPrefix: false };

  const hasDayVariance = (p.customDayPricing?.length || 0) > 0;

  if (p.hourly && p.hourly > 0)
    return { price: `£${getLowestWeeklyRate(p.hourly, p.customDayPricing)}`, unit: "/hr", fromPrefix: hasDayVariance };
  if (p.daily && p.daily > 0)
    return { price: `£${getLowestWeeklyRate(p.daily, p.customDayPricing)}`, unit: "/day", fromPrefix: hasDayVariance };
  if (p.weekly && p.weekly > 0) return { price: `£${p.weekly}`, unit: "/week", fromPrefix: false };
  if (p.monthly && p.monthly > 0) return { price: `£${p.monthly}`, unit: "/month", fromPrefix: false };

  if (p.hourlyPrice && p.hourlyPrice > 0)
    return { price: `£${getLowestWeeklyRate(p.hourlyPrice, p.customDayPricing)}`, unit: "/hr", fromPrefix: hasDayVariance };
  if (p.weekdayPrice && p.weekdayPrice > 0)
    return { price: `£${getLowestWeeklyRate(p.weekdayPrice, p.customDayPricing)}`, unit: "/day", fromPrefix: hasDayVariance };

  return { price: "POA", unit: "", fromPrefix: false };
};

const getLegacyPrice = (property) => {
  if (property?.price !== undefined && property?.price !== null) {
    return property.price;
  }

  if (property?.pricing?.pricingType === "HOURLY") {
    return property?.pricing?.hourlyPrice ?? 0;
  }

  return property?.pricing?.weekdayPrice ?? 0;
};

const getLegacyPriceUnit = (property) => {
  if (property?.priceUnit) return property.priceUnit;

  if (property?.pricing?.pricingType === "HOURLY") {
    return "hour";
  }

  return "night";
};

const resolveListingData = ({
  property,
  id,
  image,
  title,
  location,
  category,
  price,
  priceUnit,
  rating,
  reviewCount,
  badge,
  isSaved,
  isNew,
  isLoading,
}) => {
  const source = property || {};
  const listingPrice = getListingPrice(source);

  return {
    id: id ?? source._id ?? source.id ?? "listing",
    slug: source.slug ?? null,
    image:
      image ??
      source.image ??
      source.coverImage ??
      source.images?.[0] ??
      "https://via.placeholder.com/800x600?text=VenCome",
    title: title ?? source.title ?? "Untitled space",
    location:
      location ??
      source.location?.address ??
      source.location ??
      "Location unavailable",
    category: category ?? source.category ?? "Commercial Space",
    categories: source.categories?.length > 0
      ? source.categories.map((c) => c?.name || c).filter(Boolean)
      : [],
    price: price ?? listingPrice.price ?? getLegacyPrice(source),
    priceUnit: priceUnit ?? listingPrice.unit ?? getLegacyPriceUnit(source),
    priceFromPrefix: listingPrice.fromPrefix ?? false,
    rating: rating ?? source.rating ?? 0,
    reviewCount: reviewCount ?? source.reviewCount ?? 0,
    badge: badge ?? source.badge ?? null,
    isSaved: Boolean(isSaved),
    isNew: Boolean(isNew),
    isLoading: Boolean(isLoading),
  };
};

function SkeletonCard() {
  return (
    <div className="w-full">
      <style>{`
        @keyframes vencome-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
        <div
          className="aspect-[4/3] w-full rounded-[12px]"
          style={{
            background:
              "linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)",
            backgroundSize: "200% 100%",
            animation: "vencome-shimmer 1.5s infinite",
          }}
        />

        <div className="px-1 pb-1 pt-3">
          {["80%", "60%", "40%", "55%"].map((width, index) => (
            <div
              key={width}
              className={`rounded-full ${index === 0 ? "h-4" : "h-3"} ${
                index === 3 ? "mt-4" : "mt-3"
              }`}
              style={{
                width,
                background:
                  "linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)",
                backgroundSize: "200% 100%",
                animation: "vencome-shimmer 1.5s infinite",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PropertyCard({
  id,
  image,
  title,
  location,
  category,
  price,
  priceUnit,
  rating = 0,
  reviewCount = 0,
  badge = null,
  isSaved = false,
  onSave,
  isNew = false,
  isLoading = false,
  property,
  onEdit,
  onDelete,
}) {
  const listing = resolveListingData({
    property,
    id,
    image,
    title,
    location,
    category,
    price,
    priceUnit,
    rating,
    reviewCount,
    badge,
    isSaved,
    isNew,
    isLoading,
  });

  const displayBadge = listing.badge || (listing.isNew ? "New" : null);
  const badgeClassName =
    BADGE_STYLES[displayBadge] || "bg-[#0A1628] text-white";
  const displayPrice =
    typeof listing.price === "number"
      ? `£${formatPrice(listing.price)}`
      : listing.price || "POA";
  const displayUnit = listing.priceUnit
    ? listing.priceUnit.startsWith("/")
      ? listing.priceUnit
      : `/${listing.priceUnit}`
    : "";

  const handleSave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (onSave) onSave(listing.id);
  };

  if (listing.isLoading) {
    return <SkeletonCard />;
  }

  return (
    <>
      <style>{`
        .vencome-card-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group w-full"
      >
        <div className="overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-out group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.14)]">
          <Link to={`/property/${listing.slug || listing.id}`} className="block">
            <div className="relative overflow-hidden rounded-[12px]">
              <div className="aspect-[4/3] w-full" />

              <img
                src={listing.image}
                alt={listing.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.05]"
              />

              {displayBadge ? (
                <span
                  className={`absolute left-3 top-3 z-[2] rounded-full px-3 py-[5px] text-[11px] font-bold uppercase tracking-[0.5px] ${badgeClassName}`}
                >
                  {displayBadge}
                </span>
              ) : null}

              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                onClick={handleSave}
                className="absolute right-3 top-3 z-[2] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-none bg-white/90 backdrop-blur-sm"
                aria-label={listing.isSaved ? "Remove from saved" : "Save listing"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {listing.isSaved ? (
                    <motion.span
                      key="saved"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      className="flex items-center justify-center text-[#305CDE]"
                    >
                      <Heart size={16} fill="currentColor" stroke="currentColor" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="unsaved"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      className="flex items-center justify-center text-[#111827]"
                    >
                      <Heart size={16} fill="transparent" stroke="currentColor" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="px-2 pb-1 pt-3 sm:px-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[#6B7280]">
                  <MapPin size={12} />
                  <span className="truncate whitespace-nowrap text-[13px]">{listing.location}</span>
                </div>

                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1">
                    <Star
                      size={12}
                      className="fill-[#305CDE] text-[#305CDE]"
                    />
                    <span className="text-[13px] font-semibold text-[#111827]">
                      {Number(listing.rating).toFixed(2)}
                    </span>
                    <span className="text-[12px] text-[#6B7280]">
                      ({listing.reviewCount})
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="vencome-card-title mt-1 text-[15px] font-semibold text-[#111827]">
                {listing.title}
              </h3>

              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {listing.categories.length > 0 ? (
                  listing.categories.map((catName) => (
                    <span
                      key={catName}
                      className="inline-block rounded-md bg-[rgba(10,22,40,0.06)] px-2 py-[3px] text-[11px] font-semibold tracking-[0.3px] text-[#0A1628]"
                    >
                      {catName}
                    </span>
                  ))
                ) : (
                  <span className="inline-block rounded-md bg-[rgba(10,22,40,0.06)] px-2 py-[3px] text-[11px] font-semibold tracking-[0.3px] text-[#0A1628]">
                    {listing.category}
                  </span>
                )}
              </div>

              <p className="mt-2.5 text-left">
                {listing.priceFromPrefix ? (
                  <span className="text-[13px] font-normal text-[#6B7280]">From </span>
                ) : null}
                <span className="text-[16px] font-bold text-[#111827]">
                  {displayPrice}
                </span>
                {displayUnit ? (
                  <span className="text-[13px] font-normal text-[#6B7280]">
                    {displayUnit}
                  </span>
                ) : null}
              </p>
            </div>
          </Link>

          {onEdit || onDelete ? (
            <div className="mt-3 flex gap-2 border-t border-[#E5E7EB] px-1 pt-3">
              {onEdit ? (
                <button
                  type="button"
                  onClick={() => onEdit(property || listing)}
                  className="flex-1 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#0A1628] transition hover:border-[#305CDE] hover:bg-[#F8F6F0]"
                >
                  Edit
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(listing.id)}
                  className="flex-1 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#0A1628] transition hover:border-[#305CDE] hover:bg-[#F8F6F0]"
                >
                  Delete
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </motion.div>
    </>
  );
}
