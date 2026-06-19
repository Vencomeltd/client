import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  GraduationCap,
  HeadphonesIcon,
  Landmark,
  Lock,
  Palette,
  Presentation,
  PartyPopper,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UtensilsCrossed,
  Warehouse,
} from "lucide-react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import Footer from "../components/Footer";

const BRAND = {
  navy: "#0A1628",
  gold: "#305CDE",
  goldDark: "#305CDE",
  bg: "#F8F6F0",
  white: "#FFFFFF",
  text: "#111827",
  mid: "#6B7280",
  border: "#E5E7EB",
};

const SECTION_REVEAL = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" },
};

const CITY_GROUPS = [
  {
    icon: Landmark,
    label: "United Kingdom",
    cities: [
      { name: "London", count: 240 },
      { name: "Manchester", count: 89 },
      { name: "Birmingham", count: 72 },
      { name: "Edinburgh", count: 44 },
      { name: "Leeds", count: 39 },
      { name: "Bristol", count: 36 },
    ],
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Search & Discover",
    description:
      "Browse thousands of verified commercial spaces filtered by location, type, duration, and budget.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Book Instantly",
    description:
      "Choose your dates and duration. Book instantly or send a request — your payment is held securely in escrow.",
  },
  {
    number: "03",
    icon: Building2,
    title: "Move Right In",
    description:
      "Access your space on the agreed date. After checkout, payment releases to the host. Simple, transparent, secure.",
  },
];

const TRUST_SIGNALS = [
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    description: "Every space is verified by our team before going live.",
  },
  {
    icon: Lock,
    title: "Secure Escrow",
    description: "Your payment is held safely until your booking is complete.",
  },
  {
    icon: Clock3,
    title: "Flexible Booking",
    description: "Book by the hour, day, month, or year — on your terms.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our team is available around the clock to resolve any issues.",
  },
];

const buildSearchHref = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `/search?${queryString}` : "/search";
};

const CATEGORY_ICON_MAP = {
  "Office Space": Building2,
  "Co-working & Flex Space": BriefcaseBusiness,
  "Meeting & Conference Rooms": Presentation,
  "Event Venues": PartyPopper,
  "Retail & Showroom": ShoppingBag,
  "Industrial & Warehouse": Warehouse,
  "Studio Space": Palette,
  "Hospitality & Leisure": UtensilsCrossed,
  "Medical & Clinical": Stethoscope,
  "Educational & Training": GraduationCap,
  "Other / Custom": Sparkles,
  "Beauty & Cosmetics": Sparkles,
  "Fitness Spaces": Sparkles,
  "Treatment Rooms": Stethoscope,
  "Lab Rooms": Sparkles,
  "Clean Rooms": Sparkles,
  "Content Creator Space": Sparkles,
};

const getListingPrice = (listing) => {
  const p = listing?.pricing;
  if (!p) return { price: "POA", unit: "" };

  if (p.hourly && p.hourly > 0) return { price: `£${p.hourly}`, unit: "/hr" };
  if (p.daily && p.daily > 0) return { price: `£${p.daily}`, unit: "/day" };
  if (p.weekly && p.weekly > 0) return { price: `£${p.weekly}`, unit: "/week" };
  if (p.monthly && p.monthly > 0) return { price: `£${p.monthly}`, unit: "/month" };

  if (p.hourlyPrice && p.hourlyPrice > 0) return { price: `£${p.hourlyPrice}`, unit: "/hr" };
  if (p.weekdayPrice && p.weekdayPrice > 0)
    return { price: `£${p.weekdayPrice}`, unit: "/day" };

  return { price: "POA", unit: "" };
};

function HeroSection() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, 150]);
  const headlineWords = ["Find", "Your", "Perfect", "Commercial", "Space"];

  return (
    <motion.section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ backgroundColor: "#0A1628" }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          y: bgY,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80')",
        }}
      />

      <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,22,40,0.58)" }} />

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 pt-[144px] text-center md:pb-20 md:pt-[160px]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1
          className="max-w-5xl font-extrabold tracking-[-1px] text-white"
          style={{ fontSize: "clamp(36px, 8vw, 80px)", lineHeight: 1.05 }}
        >
          <span className="block">
            {headlineWords.slice(0, 3).map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="mr-[0.28em] inline-block last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="block">
            {headlineWords.slice(3).map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: (index + 3) * 0.08 }}
                className="mr-[0.28em] inline-block last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 3.6vw, 18px)",
            color: "rgba(255,255,255,0.8)",
            maxWidth: 520,
            lineHeight: 1.65,
            marginTop: 16,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          Offices, studios, event venues and more — book by the hour, day, or year.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <Link
            to="/search"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 9999,
              background: "#2E58EC",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(46,88,236,0.4)",
              minHeight: 52,
              whiteSpace: "nowrap",
            }}
          >
            <Search size={17} />
            Find a Space
          </Link>

          <Link
            to="/create-space"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              minHeight: 52,
              whiteSpace: "nowrap",
            }}
          >
            List Your Space
          </Link>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <ChevronDown size={28} />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

function CategoryStrip() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/with-counts`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <motion.section
      {...SECTION_REVEAL}
      className="bg-white py-7 md:py-10 lg:py-12"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#305CDE]">
          Browse by Category
        </p>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative mt-6"
        >
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-4 [scrollbar-width:none] md:gap-4">
            {categories.map((category) => {
              const Icon = CATEGORY_ICON_MAP[category.name] || Sparkles;
              const isActive = category.hasListings;
              const cardClasses =
                "flex min-w-[90px] flex-col items-center gap-2.5 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-center transition duration-200 hover:border-[#305CDE] hover:shadow-[0_4px_16px_rgba(48,92,222,0.15)] cursor-pointer md:min-w-[120px] md:px-5";
              const iconWrapClasses =
                "flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F7FF] text-[#305CDE]";
              const labelClasses = "text-[13px] font-semibold text-[#111827]";
              const linkTo = isActive
                ? buildSearchHref({ category: category._id })
                : `/category-coming-soon/${encodeURIComponent(category.name)}`;
              return (
              <motion.div
                key={category._id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
              >
                <Link to={linkTo} className={cardClasses}>
                  <span className={iconWrapClasses}>
                    <Icon size={24} />
                  </span>
                  <span className={labelClasses}>{category.name}</span>
                </Link>
              </motion.div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
        </motion.div>
      </div>
    </motion.section>
  );
}

function FeaturedSpaces({ featuredListings, popularListings, loadingListings }) {
  const scrollRef = useRef(null);
  const listingsToRender = popularListings.length > 0 ? popularListings : featuredListings;

  if (!loadingListings && listingsToRender.length === 0) {
    return null;
  }

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction * 340,
      behavior: "smooth",
    });
  };

  return (
    <motion.section
      {...SECTION_REVEAL}
      className="bg-[#F8F6F0] py-7 md:py-10 lg:py-16"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-4 md:mb-8 md:gap-6">
          <h2 className="text-[clamp(20px,4vw,32px)] font-bold text-[#0A1628]">
            Popular Spaces Near You
          </h2>
          <Link
            to="/search"
            className="text-sm font-medium text-[#305CDE] transition hover:text-[#305CDE]"
          >
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.15)] md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={scrollRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none]"
          >
            {(loadingListings
              ? Array.from({ length: 4 }, (_, index) => ({
                  id: `skeleton-${index}`,
                  isLoading: true,
                }))
              : listingsToRender
            ).map((listing) => (
              (() => {
                const { price, unit } = getListingPrice(listing);

                return (
                  <div
                    key={listing.id || listing._id}
                    className="min-w-[260px] shrink-0 md:min-w-[300px]"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <PropertyCard
                      id={listing._id}
                      image={listing.coverImage}
                      title={listing.title}
                      location={`${listing.location?.city || ""}, ${listing.location?.country || ""}`}
                      price={price}
                      priceUnit={unit}
                      category={listing.category?.name || ""}
                      isLoading={listing.isLoading}
                      property={listing}
                      variant="homepage"
                    />
                  </div>
                );
              })()
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.15)] md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function BrowseByCity() {
  return (
    <motion.section
      {...SECTION_REVEAL}
      className="bg-white py-7 md:py-10 lg:py-16"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <h2 className="text-[clamp(20px,4vw,32px)] font-bold text-[#0A1628]">Browse by City</h2>

        <div className="mt-10 space-y-10">
          {CITY_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
            <div key={group.label}>
              <div className="flex items-center gap-2 text-[#305CDE]">
                <Icon size={15} />
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em]">
                  {group.label}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

function HowItWorks() {
  return (
    <motion.section
      {...SECTION_REVEAL}
      className="bg-[#F8F6F0] py-7 md:py-10 lg:py-20"
    >
      <div className="mx-auto max-w-[1440px] px-4 text-center md:px-6">
        <h2 className="text-[clamp(20px,4vw,32px)] font-extrabold text-[#0A1628]">
          How VenCome Works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[#6B7280]">
          Find and book commercial spaces in three simple steps.
        </p>

        <div className="mx-auto mt-12 grid max-w-[900px] grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 text-center md:p-9"
              >
                <div className="text-[48px] font-extrabold text-[#305CDE]/40">
                  {step.number}
                </div>
                <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(48,92,222,0.3)] bg-[rgba(48,92,222,0.12)]">
                  <Icon size={22} className="text-[#305CDE]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#0A1628]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#6B7280]">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

function BecomeAHost() {
  return (
    <motion.section
      {...SECTION_REVEAL}
      className="bg-[#0A1628] py-7 md:py-10 lg:py-20"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 px-4 md:px-6 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[#305CDE]">
            For Property Owners
          </p>
          <h2 className="max-w-2xl text-[clamp(28px,6vw,48px)] font-extrabold leading-tight text-white">
            List Your Space.
            <br />
            Start Earning.
          </h2>
          <p className="mt-4 max-w-[440px] text-base leading-7 text-white/70">
            Join hundreds of commercial property owners earning consistent
            revenue through VenCome. List your space in under 10 minutes - we
            handle payments, contracts, and disputes.
          </p>

          <div className="mt-9">
            <Link
              to="/create-space"
              className="inline-flex min-h-[44px] rounded-[10px] bg-[#305CDE] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#254FC7]"
            >
              Publish Your Space
            </Link>
            <div className="mt-4">
              <Link
                to="/create-space"
                className="text-sm text-white transition hover:underline"
              >
                Learn how hosting works →
              </Link>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-2">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
            alt="Commercial building exterior"
            className="aspect-[4/3] w-full rounded-[20px] object-cover"
          />

          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <TrendingUp size={16} />
            </span>
            <span className="text-sm font-semibold text-[#111827]">
              £1,240 earned this month
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function TrustSignals() {
  return (
    <motion.section
      {...SECTION_REVEAL}
      className="bg-white py-7 md:py-10 lg:py-12"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#E5E7EB]">
          {TRUST_SIGNALS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="px-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(48,92,222,0.12)] text-[#305CDE]">
                  <Icon size={24} />
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-[#0A1628]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-[#6B7280]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

export default function Homepage() {
  const [activeTab, setActiveTab] = useState("spaces");
  const [featuredListings, setFeaturedListings] = useState([]);
  const [popularListings, setPopularListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/properties?limit=8`);
        const data = await response.json();
        const properties = data.properties || [];
        setFeaturedListings(properties.slice(0, 4));
        setPopularListings(properties.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        html {
          overflow-x: hidden;
        }
        body {
          overflow-x: hidden;
        }
      `}</style>

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="bg-[#F8F6F0] text-[#111827]">
        <HeroSection />
        <CategoryStrip />
        <FeaturedSpaces
          featuredListings={featuredListings}
          popularListings={popularListings}
          loadingListings={loadingListings}
        />
        <BrowseByCity />
        <HowItWorks />
        <BecomeAHost />
        <TrustSignals />
      </main>
      <Footer />
    </>
  );
}
