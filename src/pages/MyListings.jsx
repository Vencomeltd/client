import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  BarChart2,
  Building2,
  CalendarDays,
  CheckCircle2,
  Copy,
  Edit2,
  Eye,
  LayoutGrid,
  Link as LinkIcon,
  List,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Plus,
  PoundSterling,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";

const MOCK_LISTINGS = [
  {
    id: 1,
    title: "The Shard Executive Suite",
    location: "London Bridge, London",
    category: "Office Space",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
    status: "live",
    pricing: { hour: 85, day: 580, month: 7800 },
    stats: { views: 1240, enquiries: 47, bookings: 23, revenue: 18650 },
    rating: 4.92,
    reviewCount: 47,
    capacity: 24,
    createdAt: "12 Jan 2026",
    lastBooked: "1 May 2026",
    instantBook: true,
    featured: true,
  },
  {
    id: 2,
    title: "Canary Wharf Hot Desk Pod",
    location: "Canary Wharf, London",
    category: "Co-working",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    status: "live",
    pricing: { hour: 18, day: 95, month: 1200 },
    stats: { views: 873, enquiries: 31, bookings: 61, revenue: 5795 },
    rating: 4.75,
    reviewCount: 61,
    capacity: 1,
    createdAt: "3 Feb 2026",
    lastBooked: "15 May 2026",
    instantBook: true,
    featured: false,
  },
  {
    id: 3,
    title: "Mayfair Boardroom",
    location: "Mayfair, London",
    category: "Meeting Rooms",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80",
    status: "paused",
    pricing: { hour: 120, day: 780 },
    stats: { views: 340, enquiries: 12, bookings: 8, revenue: 6240 },
    rating: 4.88,
    reviewCount: 8,
    capacity: 16,
    createdAt: "20 Mar 2026",
    lastBooked: "28 Apr 2026",
    instantBook: false,
    featured: false,
  },
  {
    id: 4,
    title: "Shoreditch Photography Studio",
    location: "Shoreditch, London",
    category: "Studio Space",
    image:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&q=80",
    status: "draft",
    pricing: { hour: 65, day: 380 },
    stats: { views: 0, enquiries: 0, bookings: 0, revenue: 0 },
    rating: null,
    reviewCount: 0,
    capacity: 8,
    createdAt: "10 May 2026",
    lastBooked: null,
    instantBook: false,
    featured: false,
  },
];

const FILTERS = ["all", "live", "paused", "draft"];
const SORT_OPTIONS = [
  "Newest",
  "Oldest",
  "Most Views",
  "Most Bookings",
  "Highest Revenue",
];

const formatNumber = (value) => new Intl.NumberFormat("en-GB").format(value);
const formatCurrency = (value) => `£${formatNumber(value)}`;

const getStatusBadgeClasses = (status) =>
  ({
    live: "bg-[#16A34A] text-white",
    paused: "bg-[#D97706] text-white",
    draft: "bg-[#6B7280] text-white",
  }[status]);

const getPrimaryPrice = (pricing) => {
  if (pricing.hour) return `from ${formatCurrency(pricing.hour)}/hr`;
  if (pricing.day) return `from ${formatCurrency(pricing.day)}/day`;
  if (pricing.month) return `from ${formatCurrency(pricing.month)}/mo`;
  return "Pricing pending";
};

function SmallButton({ children, tone = "outline", onClick }) {
  const toneClasses = {
    outline:
      "border-[1.5px] border-[#E5E7EB] bg-white text-[#111827] hover:border-[#0A1628]",
    gold: "bg-[#305CDE] text-white hover:bg-[#254FC7]",
    navy: "bg-[#0A1628] text-white hover:bg-[#13243f]",
    warning: "bg-transparent text-[#D97706] hover:underline",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}

function MoreOptionsMenu({
  listing,
  confirmDelete,
  onClose,
  onCopyUrl,
  onDelete,
  setConfirmDelete,
}) {
  const items = [
    {
      icon: Eye,
      label: "Preview Listing",
      action: () =>
        window.open(`/property/${listing.id}`, "_blank", "noopener,noreferrer"),
    },
    {
      icon: Copy,
      label: "Duplicate Listing",
      action: () => console.log("duplicate", listing.id),
    },
    {
      icon: LinkIcon,
      label: "Copy Listing URL",
      action: () => onCopyUrl(listing.id),
    },
    {
      icon: Archive,
      label: "Archive",
      action: () => console.log("archive", listing.id),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] border border-[#E5E7EB] bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] md:absolute md:inset-auto md:right-3 md:top-12 md:min-w-[180px] md:rounded-xl md:p-2 md:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      {confirmDelete === listing.id ? (
        <div className="rounded-lg px-3 py-2">
          <p className="text-[13px] font-medium text-[#111827]">Are you sure?</p>
          <div className="mt-2 flex items-center gap-3 text-[13px]">
            <button
              type="button"
              onClick={() => onDelete(listing.id)}
              className="font-medium text-[#DC2626] hover:underline"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="text-[#6B7280] hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[14px] text-[#111827] transition hover:bg-[#F8F6F0]"
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setConfirmDelete(listing.id)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[14px] text-[#DC2626] transition hover:bg-[#F8F6F0]"
          >
            <Trash2 size={16} />
            <span>Delete Listing</span>
          </button>
        </>
      )}
    </motion.div>
  );
}

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("Newest");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const menuContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
        setConfirmDeleteId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const counts = useMemo(
    () => ({
      all: listings.length,
      live: listings.filter((listing) => listing.status === "live").length,
      paused: listings.filter((listing) => listing.status === "paused").length,
      draft: listings.filter((listing) => listing.status === "draft").length,
    }),
    [listings]
  );

  const aggregateStats = useMemo(() => {
    const totals = listings.reduce(
      (accumulator, listing) => {
        accumulator.revenue += listing.stats.revenue;
        accumulator.bookings += listing.stats.bookings;
        accumulator.views += listing.stats.views;

        if (listing.rating) {
          accumulator.ratingTotal += listing.rating;
          accumulator.ratedCount += 1;
        }

        return accumulator;
      },
      { revenue: 0, bookings: 0, views: 0, ratingTotal: 0, ratedCount: 0 }
    );

    return {
      revenue: formatCurrency(totals.revenue),
      bookings: formatNumber(totals.bookings),
      views: formatNumber(totals.views),
      averageRating: totals.ratedCount
        ? (totals.ratingTotal / totals.ratedCount).toFixed(2)
        : "0.00",
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    const filtered = listings.filter((listing) =>
      activeFilter === "all" ? true : listing.status === activeFilter
    );

    const sorted = [...filtered];
    sorted.sort((left, right) => {
      if (sortBy === "Newest") return right.id - left.id;
      if (sortBy === "Oldest") return left.id - right.id;
      if (sortBy === "Most Views") return right.stats.views - left.stats.views;
      if (sortBy === "Most Bookings") {
        return right.stats.bookings - left.stats.bookings;
      }
      if (sortBy === "Highest Revenue") {
        return right.stats.revenue - left.stats.revenue;
      }
      return 0;
    });

    return sorted;
  }, [activeFilter, listings, sortBy]);

  const handleCopyUrl = async (listingId) => {
    try {
      const url = `${window.location.origin}/property/${listingId}`;
      await navigator.clipboard.writeText(url);
      setToastMessage("Listing URL copied to clipboard");
    } catch {
      setToastMessage("Could not copy listing URL");
    }
  };

  const handleDelete = (listingId) => {
    setListings((current) =>
      current.filter((listing) => listing.id !== listingId)
    );
    setOpenMenuId(null);
    setConfirmDeleteId(null);
    setToastMessage("Listing deleted");
  };

  const handleStatusChange = (listingId, nextStatus) => {
    setListings((current) =>
      current.map((listing) =>
        listing.id === listingId ? { ...listing, status: nextStatus } : listing
      )
    );
  };

  const pageSubtitle = `${counts.all} spaces · ${counts.live} live · ${counts.draft} draft`;

  const emptySubtitle =
    activeFilter === "all"
      ? "You have not created any listings yet. Start by adding your first commercial space."
      : `There are no ${activeFilter} listings matching this view right now.`;

  const statCards = [
    { icon: PoundSterling, label: "Total Revenue", value: aggregateStats.revenue },
    { icon: CalendarDays, label: "Total Bookings", value: aggregateStats.bookings },
    { icon: Eye, label: "Total Views", value: aggregateStats.views },
    { icon: Star, label: "Avg Rating", value: aggregateStats.averageRating },
  ];

  return (
    <DashboardLayout title="My Listings">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[24px] font-extrabold text-[#0A1628]">My Listings</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">{pageSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/host/create")}
          className="inline-flex items-center gap-2 rounded-[10px] bg-[#305CDE] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#254FC7]"
        >
          <Plus size={16} />
          <span>Add New Space</span>
        </button>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[14px] border border-[#E5E7EB] bg-white px-5 py-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(48,92,222,0.2)] bg-[rgba(48,92,222,0.1)] text-[#305CDE]">
                <Icon size={20} />
              </div>
              <p className="mt-3 text-[13px] text-[#6B7280]">{card.label}</p>
              <p className="mt-1 text-[28px] font-extrabold text-[#0A1628]">
                {card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                activeFilter === filter
                  ? "bg-[#0A1628] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#111827]"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)} ({counts[filter]})
            </button>
          ))}
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="flex items-center gap-2">
            {[
              { key: "grid", icon: LayoutGrid, label: "Grid view" },
              { key: "list", icon: List, label: "List view" },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-label={option.label}
                  onClick={() => setViewMode(option.key)}
                  className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition ${
                    viewMode === option.key
                      ? "bg-[#0A1628] text-white"
                      : "border border-[#E5E7EB] bg-white text-[#6B7280]"
                  }`}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${activeFilter}-${sortBy}-${filteredListings.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {filteredListings.length === 0 ? (
            <div className="rounded-[20px] border border-[#E5E7EB] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F6F0] text-[#6B7280]">
                <Building2 size={48} />
              </div>
              <h3 className="mt-5 text-[18px] font-bold text-[#0A1628]">
                No listings found
              </h3>
              <p className="mt-2 text-[14px] text-[#6B7280]">{emptySubtitle}</p>
              {activeFilter === "all" ? (
                <button
                  type="button"
                  onClick={() => navigate("/host/create")}
            className="mt-6 inline-flex min-h-[44px] rounded-[10px] bg-[#305CDE] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#254FC7]"
                >
                  + Create Your First Listing
                </button>
              ) : null}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="group overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)]"
                >
                  <div className="relative h-[180px] overflow-hidden md:h-[200px]">
                    <motion.img
                      src={listing.image}
                      alt={listing.title}
                      whileHover={{ scale: 1.04 }}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />

                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] ${getStatusBadgeClasses(
                        listing.status
                      )}`}
                    >
                      {listing.status}
                    </span>

                    {listing.featured ? (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#305CDE] px-3 py-1 text-[11px] font-bold text-white">
                        <Star size={12} color="#C9A84C" fill="#C9A84C" />
                        Featured
                      </span>
                    ) : null}

                    <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => navigate("/host/create")}
                        className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-white text-[#0A1628] shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                        aria-label="Edit listing"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `/property/${listing.id}`,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-white text-[#0A1628] shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                        aria-label="Preview listing"
                      >
                        <Eye size={16} />
                      </button>

                      <div
                        className="relative"
                        ref={openMenuId === listing.id ? menuContainerRef : null}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteId(null);
                            setOpenMenuId((current) =>
                              current === listing.id ? null : listing.id
                            );
                          }}
                          className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-white text-[#0A1628] shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                          aria-label="Open more options"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        <AnimatePresence>
                          {openMenuId === listing.id ? (
                            <MoreOptionsMenu
                              listing={listing}
                              confirmDelete={confirmDeleteId}
                              onClose={() => setOpenMenuId(null)}
                              onCopyUrl={handleCopyUrl}
                              onDelete={handleDelete}
                              setConfirmDelete={setConfirmDeleteId}
                            />
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-[18px]">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[16px] font-bold text-[#0A1628]">
                        {listing.title}
                      </h3>
                      <p className="text-right text-[14px] font-semibold text-[#305CDE]">
                        {getPrimaryPrice(listing.pricing)}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                        <MapPin size={12} />
                        <span>{listing.location}</span>
                      </div>
                      <span className="rounded-full bg-[#0A1628] px-2.5 py-1 text-[11px] font-semibold text-white">
                        {listing.category}
                      </span>
                    </div>

                    <div className="my-3 border-t border-[#F3F4F6]" />

                    <div className="grid grid-cols-2 divide-x divide-[#F3F4F6] sm:grid-cols-4">
                      {[
                        {
                          icon: Eye,
                          value: formatNumber(listing.stats.views),
                          label: "Views",
                          className: "hidden sm:block",
                        },
                        {
                          icon: MessageSquare,
                          value: formatNumber(listing.stats.enquiries),
                          label: "Enquiries",
                          className: "hidden sm:block",
                        },
                        {
                          icon: CalendarDays,
                          value: formatNumber(listing.stats.bookings),
                          label: "Bookings",
                        },
                        {
                          icon: PoundSterling,
                          value: formatCurrency(listing.stats.revenue),
                          label: "Revenue",
                        },
                      ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <div key={stat.label} className={`px-2 text-center ${stat.className || ""}`}>
                            <Icon size={14} className="mx-auto text-[#6B7280]" />
                            <p className="mt-1 text-[15px] font-bold text-[#0A1628]">
                              {stat.value}
                            </p>
                            <p className="text-[11px] text-[#6B7280]">{stat.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-col gap-2 text-[13px] md:flex-row md:items-center md:justify-between">
                      {listing.rating ? (
                        <div className="inline-flex items-center gap-1.5 text-[#374151]">
                          <Star size={14} className="fill-[#305CDE] text-[#305CDE]" />
                          <span>{listing.rating}</span>
                          <span>({listing.reviewCount} reviews)</span>
                        </div>
                      ) : (
                        <span className="text-[#6B7280]">No reviews yet</span>
                      )}

                      <span className="text-[12px] text-[#6B7280]">
                        Last booked: {listing.lastBooked || "Not booked yet"}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-[#F3F4F6] pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <SmallButton onClick={() => navigate("/host/create")}>
                            <Edit2 size={14} />
                            Edit Listing
                          </SmallButton>
                          <SmallButton>
                            <BarChart2 size={14} />
                            View Analytics
                          </SmallButton>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {listing.status === "live" ? (
                            <SmallButton
                              tone="warning"
                              onClick={() =>
                                handleStatusChange(listing.id, "paused")
                              }
                            >
                              <PauseCircle size={14} />
                              Pause
                            </SmallButton>
                          ) : null}

                          {listing.status === "paused" ? (
                            <SmallButton
                              tone="gold"
                              onClick={() => handleStatusChange(listing.id, "live")}
                            >
                              <PlayCircle size={14} />
                              Go Live
                            </SmallButton>
                          ) : null}

                          {listing.status === "draft" ? (
                            <SmallButton
                              tone="gold"
                              onClick={() => handleStatusChange(listing.id, "live")}
                            >
                              <Upload size={14} />
                              Publish
                            </SmallButton>
                          ) : null}

                          <SmallButton
                            tone="navy"
                            onClick={() => navigate("/host/bookings")}
                          >
                            Manage Bookings
                          </SmallButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.08 }}
                  className="flex flex-col gap-4 rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-4 lg:flex-row lg:items-center lg:px-5"
                >
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="hidden h-[180px] w-full rounded-[10px] object-cover lg:block lg:h-20 lg:w-[100px] lg:shrink-0"
                  />

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] ${getStatusBadgeClasses(
                      listing.status
                    )}`}
                  >
                    {listing.status}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-bold text-[#0A1628]">
                      {listing.title}
                    </h3>
                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      {listing.location}
                    </p>
                    <p className="mt-2 text-[13px] text-[#374151]">
                      {formatNumber(listing.stats.views)} views |{" "}
                      {formatNumber(listing.stats.bookings)} bookings |{" "}
                      {formatCurrency(listing.stats.revenue)} revenue
                    </p>
                  </div>

                  <div className="min-w-[120px] text-left lg:text-right">
                    <p className="text-[14px] font-semibold text-[#305CDE]">
                      {getPrimaryPrice(listing.pricing)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <SmallButton onClick={() => navigate("/host/create")}>
                      Edit
                    </SmallButton>
                    {listing.status === "live" ? (
                      <SmallButton
                        tone="warning"
                        onClick={() => handleStatusChange(listing.id, "paused")}
                      >
                        Pause
                      </SmallButton>
                    ) : listing.status === "paused" ? (
                      <SmallButton
                        tone="gold"
                        onClick={() => handleStatusChange(listing.id, "live")}
                      >
                        Go Live
                      </SmallButton>
                    ) : (
                      <SmallButton
                        tone="gold"
                        onClick={() => handleStatusChange(listing.id, "live")}
                      >
                        Publish
                      </SmallButton>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-[10px] bg-[#0A1628] px-5 py-3 text-[14px] font-medium text-white shadow-lg"
          >
            <CheckCircle2 size={16} className="text-[#16A34A]" />
            <span>{toastMessage}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DashboardLayout>
  );
}
