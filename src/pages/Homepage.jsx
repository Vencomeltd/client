import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLoaderData, useNavigate, useRouteLoaderData } from "react-router-dom";
import { edgeCached } from "../utils/edgeCache";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  BriefcaseBusiness,
  CalendarDays,
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
  UtensilsCrossed,
  Warehouse,
} from "lucide-react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import Footer from "../components/Footer";
import PlatformReviewsSection from "../components/PlatformReviewsSection";

const BRAND = {
  navy: "#0A1628",
  gold: "#305CDE",
  goldDark: "#305CDE",
  bg: "#FFFFFF",
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

const COUNTRY_ICON_MAP = {
  "United Kingdom": Landmark,
};

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Search & Discover",
    description:
      "Browse verified commercial spaces across London, filtered by location, type, duration, and budget.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Request to Book",
    description:
      "Choose your dates and enter your card details to send a booking request. Your host is notified and confirms availability, at which point you're charged and payment is held securely in escrow, not released to the host yet.",
  },
  {
    number: "03",
    icon: Building2,
    title: "Move Right In",
    description:
      "Access your space on the agreed date. Payment reaches the host 24–72 hours after your booking ends. If something isn't as described, you can raise it with us directly and we'll review it case by case.",
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

// Hero background clips (muted, looping) -- Kitt-style full-bleed video.
// Empty until the brand video is ready; the poster image shows instead.
// Several clips play one after another.
const HERO_VIDEOS = [];
const HERO_POSTER = "/hero-poster.jpg";

function HeroBackground() {
  const [clip, setClip] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!HERO_VIDEOS.length || reduceMotion) {
    return (
      <img
        src={HERO_POSTER}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  return (
    <video
      key={HERO_VIDEOS[clip]}
      src={HERO_VIDEOS[clip]}
      poster={HERO_POSTER}
      autoPlay
      muted
      playsInline
      loop={HERO_VIDEOS.length === 1}
      onEnded={() => setClip((i) => (i + 1) % HERO_VIDEOS.length)}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const [heroSearchLocation, setHeroSearchLocation] = useState("");

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const trimmed = heroSearchLocation.trim();
    navigate(trimmed ? `/search?location=${encodeURIComponent(trimmed)}` : "/search");
  };

  const buttonBase = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 26px",
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    textDecoration: "none",
    minHeight: 48,
    whiteSpace: "nowrap",
  };

  return (
    <section
      className="relative flex min-h-[80vh] items-center overflow-hidden md:min-h-[88vh]"
      style={{ backgroundColor: BRAND.navy }}
    >
      <HeroBackground />

      {/* Darker on the left where the text sits, lighter on the right so the
          footage shows through; evened out on small screens. */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{ background: "linear-gradient(90deg, rgba(10,22,40,0.82) 0%, rgba(10,22,40,0.55) 45%, rgba(10,22,40,0.15) 100%)" }}
      />
      <div className="absolute inset-0 md:hidden" style={{ backgroundColor: "rgba(10,22,40,0.6)" }} />

      <motion.div
        className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-16 pt-[128px] md:px-10 md:pb-20 md:pt-[150px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1
          className="max-w-[680px] text-white"
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 400,
            fontSize: "clamp(40px, 6.2vw, 76px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
          }}
        >
          The Easiest Way To Grow Your Business
        </h1>

        <p
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "rgba(255,255,255,0.85)",
            maxWidth: 520,
            lineHeight: 1.6,
            marginTop: 18,
            marginBottom: 32,
          }}
        >
          Commercial Spaces, Booked Simply
        </p>

        <form
          onSubmit={handleHeroSearch}
          className="flex w-full max-w-[440px] md:hidden"
          style={{
            marginBottom: 20,
            background: "white",
            borderRadius: 9999,
            padding: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          <input
            value={heroSearchLocation}
            onChange={(e) => setHeroSearchLocation(e.target.value)}
            placeholder="Where are you looking?"
            aria-label="Search location"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
              color: "#111827",
              padding: "0 8px 0 14px",
            }}
          />
          <button
            type="submit"
            aria-label="Search"
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "#2E58EC",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Search size={17} />
          </button>
        </form>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/search" style={{ ...buttonBase, background: "#2E58EC", color: "white" }}>
            Find a Space
          </Link>
          <Link
            to="/create-space"
            style={{ ...buttonBase, background: "transparent", color: "white", border: "1.5px solid rgba(255,255,255,0.75)" }}
          >
            List Your Space
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

// One failed API call (network error, Render blip, bad status) used to make
// fetch() throw out of the loader and turn the whole homepage into a bare
// "Application Error" page. Each call now fails on its own: that section is
// left out of the loader data, and the component's own browser-side fetch
// (categories, listings, city counts and blogs all have one) fills it in.
async function getJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return { ok: false };
    return { ok: true, body: await res.json() };
  } catch {
    return { ok: false };
  }
}

export async function loader() {
  const API = import.meta.env.VITE_API_URL;
  const [categories, listings, cities, blog] = await Promise.all([
    getJson(`${API}/categories/with-counts`),
    getJson(`${API}/properties?limit=100`),
    getJson(`${API}/properties/cities`),
    getJson(`${API}/blog?limit=3`),
  ]);

  // Server sorts by Category.order once the admin has manually reordered at
  // all, otherwise by live listing count -- no client-side reordering needed.
  const categoryList = Array.isArray(categories.body) ? categories.body : [];
  const properties = listings.ok ? listings.body?.properties || [] : undefined;

  // Failed sections are undefined (not []) so the component shows its
  // loading state and fetches them, instead of flashing an empty section.
  const payload = {
    categories: categoryList,
    countries: cities.ok && Array.isArray(cities.body?.countries) ? cities.body.countries : undefined,
    featuredListings: properties,
    popularListings: properties,
    recentBlogs: blog.ok ? blog.body?.blogs || [] : undefined,
  };
  // Only edge-cache a complete homepage -- never one with sections missing.
  const allOk = [categories, listings, cities, blog].every((r) => r.ok);
  return allOk ? edgeCached(payload) : payload;
}

// Pass the loader's headers through so edgeCached() responses carry their
// Cache-Control on both the HTML and the /<page>.data navigation response.
export function headers({ loaderHeaders }) {
  return loaderHeaders;
}

// The loader above does 4 parallel API calls and React Router blocks
// rendering until it resolves -- necessary for a fresh/first visit (this is
// what makes the homepage server-rendered for crawlers), but re-running it
// on every plain back/forward return to "/" is what was making "back" feel
// slow. Skip revalidation for that specific case; real navigations elsewhere
// (or a forced reload) still get fresh data via defaultShouldRevalidate.
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }) {
  if (currentUrl.pathname === "/" && nextUrl.pathname === "/") return false;
  return defaultShouldRevalidate;
}

function CategoryStrip() {
  const loaderData = useLoaderData();
  const [categories, setCategories] = useState(loaderData?.categories || []);
  const scrollRef = useRef(null);

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction * 260, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/with-counts`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        // Server already applies the manual-order/listing-count hybrid sort.
        setCategories(list);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    // The loader already fetched+ordered categories for the initial mount --
    // skip the redundant network call here. Still needed as a fallback when
    // there's no loader data, and for the bfcache-restore case below.
    if (!loaderData?.categories?.length) {
      fetchCategories();
    }

    // Re-fetch when the page is restored from the browser's
    // back-forward cache (bfcache), since useEffect won't re-run
    // on its own in that case and categories can be stuck empty.
    const handlePageShow = (event) => {
      if (event.persisted) {
        fetchCategories();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return (
    <section className="bg-white py-7 md:py-10 lg:py-12">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#305CDE]">
          Browse by Category
        </p>

        <div className="relative mt-6">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.15)] md:flex"
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={scrollRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] md:gap-4"
          >
            {categories.map((category) => {
              const Icon = CATEGORY_ICON_MAP[category.name] || Sparkles;
              const cardClasses =
                "flex min-w-[90px] flex-col items-center gap-2.5 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-center transition duration-200 hover:border-[#305CDE] hover:shadow-[0_4px_16px_rgba(48,92,222,0.15)] cursor-pointer md:min-w-[120px] md:px-5";
              const iconWrapClasses =
                "flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F7FF] text-[#305CDE]";
              const labelClasses = "text-[13px] font-semibold text-[#111827]";
              // CategoryPage.jsx shows its own "Coming Soon" state when a
              // category has zero live listings, so every category links
              // there now instead of splitting off to a separate route.
              const linkTo = `/category/${category.slug || category._id}`;
              return (
                <div key={category._id} style={{ scrollSnapAlign: "start" }}>
                <Link to={linkTo} className={cardClasses}>
                  <span className={iconWrapClasses}>
                    <Icon size={24} />
                  </span>
                  <span className={labelClasses}>{category.name}</span>
                </Link>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.15)] md:flex"
            aria-label="Scroll categories right"
          >
            <ChevronRight size={18} />
          </button>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}

function FeaturedSpaces({ featuredListings, popularListings, loadingListings }) {
  const listingsToRender = popularListings.length > 0 ? popularListings : featuredListings;

  if (!loadingListings && listingsToRender.length === 0) {
    return null;
  }

  return (
    <motion.section
      {...SECTION_REVEAL}
      className="bg-white py-7 md:py-10 lg:py-16"
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

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {(loadingListings
            ? Array.from({ length: 4 }, (_, index) => ({
                id: `skeleton-${index}`,
                isLoading: true,
              }))
            : listingsToRender
          ).map((listing) => (
            <PropertyCard
              key={listing.id || listing._id}
              id={listing._id}
              image={listing.coverImage}
              title={listing.title}
              location={`${listing.location?.city || ""}, ${listing.location?.country || ""}`}
              category={listing.category?.name || ""}
              isLoading={listing.isLoading}
              property={listing}
              variant="homepage"
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function BrowseByCity() {
  const loaderData = useLoaderData();
  // City landing pages (/uk/london) from the root loader; cities without one
  // (e.g. outside the UK) still fall back to a search link.
  const cityPaths = Object.fromEntries(
    (useRouteLoaderData("root")?.footerCities || []).map((c) => [c.name, c.path])
  );
  const [countries, setCountries] = useState(loaderData?.countries || []);
  const [loaded, setLoaded] = useState(!!loaderData?.countries);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/properties/cities`);
        const data = await res.json();
        setCountries(Array.isArray(data.countries) ? data.countries : []);
      } catch (err) {
        console.error("Failed to fetch city counts:", err);
      } finally {
        setLoaded(true);
      }
    };

    fetchCities();

    const handlePageShow = (event) => {
      if (event.persisted) fetchCities();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // No live listings anywhere yet — nothing to browse by, so hide the section
  // entirely rather than show empty countries/cities.
  if (loaded && countries.length === 0) return null;

  return (
    <motion.section
      {...SECTION_REVEAL}
      className="bg-white py-7 md:py-10 lg:py-16"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <h2 className="text-[clamp(20px,4vw,32px)] font-bold text-[#0A1628]">Browse by City</h2>

        <div className="mt-10 space-y-8">
          {countries.map((group) => {
            const Icon = COUNTRY_ICON_MAP[group.country] || Globe2;
            return (
              <div key={group.country}>
                <div className="flex items-center gap-2 text-[#305CDE]">
                  <Icon size={15} />
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em]">
                    {group.country}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {group.cities.map((city) => (
                    <Link
                      key={city.name}
                      to={cityPaths[city.name] || buildSearchHref({ location: city.name })}
                      className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-medium text-[#111827] transition hover:border-[#305CDE] hover:text-[#305CDE]"
                    >
                      {city.name} <span className="text-[#6B7280]">{city.count}</span>
                    </Link>
                  ))}
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
      className="bg-white py-7 md:py-10 lg:py-20"
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

function RecentBlogs({ blogs, loading }) {
  if (loading) return null;
  if (!blogs || blogs.length === 0) return null;

  return (
    <section style={{ background: "#fff", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0A1628", marginBottom: 8 }}>From the Blog</h2>
            <p style={{ fontSize: 16, color: "#6B7280" }}>Insights and guides for commercial space renters and hosts.</p>
          </div>
          <a href="/blog" style={{ fontSize: 14, fontWeight: 700, color: "#305CDE", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            View all posts →
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {blogs.slice(0, 3).map((blog) => (
            <a key={blog._id} href={`/blog/${blog.slug}`} style={{ textDecoration: "none" }}>
              <div
                style={{ background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1.5px solid #E5E7EB", transition: "box-shadow 0.2s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt={blog.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                ) : (
                  <div style={{ height: 180, background: "linear-gradient(135deg, #0A1628 0%, #305CDE 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 36 }}>✍️</span>
                  </div>
                )}
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#305CDE", background: "rgba(48,92,222,0.08)", padding: "3px 10px", borderRadius: 999 }}>
                      {blog.category}
                    </span>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>{blog.readTime} min read</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 8, lineHeight: 1.4 }}>{blog.title}</h3>
                  <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 12 }}>{blog.excerpt?.slice(0, 100)}{blog.excerpt?.length > 100 ? "..." : ""}</p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#305CDE" }}>Read more →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is VenCome?",
      a: "VenCome is a B2B commercial space rental marketplace that connects businesses with professional spaces across the UK. Whether you need an office for a day, a meeting room for an hour, or a studio for a week — VenCome makes it simple to find, book, and pay."
    },
    {
      q: "How do I book a space?",
      a: "Simply search for a space by location, date, and type. Select your preferred listing, choose your dates and duration, then click Book Now or Request to Book. You'll receive a confirmation once the host approves your request."
    },
    {
      q: "What types of spaces are available?",
      a: "VenCome offers offices, co-working spaces, meeting and conference rooms, event venues, retail and showroom spaces, studios, hospitality and leisure spaces, medical and clinical rooms, and more."
    },
    {
      q: "How does payment work?",
      a: "Payments are processed securely through Stripe. Your payment is held in escrow until after your booking is confirmed and completed. Hosts receive their payout in their bank account 24–72 hours after checkout for short-term bookings."
    },
    {
      q: "Can I cancel a booking?",
      a: "Yes. You can cancel a booking from your dashboard. Cancellation policies vary by listing — please check the specific policy on the listing page before booking."
    },
    {
      q: "How do I list my space on VenCome?",
      a: "Click 'Publish your space' in the top navigation. You'll be guided through a simple step-by-step wizard to add your space details, photos, pricing, and availability. Your listing will be live once reviewed."
    },
    {
      q: "How does VenCome make money?",
      a: "VenCome charges a 10% platform commission on each booking, automatically deducted before the host payout. There are no monthly fees or subscription costs for hosts or customers."
    },
  ];

  return (
    <section style={{ background: "#fff", padding: "80px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0A1628", marginBottom: 12 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.6 }}>
            Everything you need to know about VenCome.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                border: "1.5px solid",
                borderColor: openIndex === i ? "#305CDE" : "#E5E7EB",
                borderRadius: 14,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 22px",
                  background: openIndex === i ? "#F8F9FF" : "#fff",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 16,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", lineHeight: 1.4 }}>
                  {faq.q}
                </span>
                <span style={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: openIndex === i ? "#305CDE" : "#F3F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d={openIndex === i ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"}
                      stroke={openIndex === i ? "#fff" : "#6B7280"}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              {openIndex === i && (
                <div style={{ padding: "0 22px 18px", background: "#F8F9FF" }}>
                  <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            Still have questions?{" "}
            <a href="/contact" style={{ color: "#305CDE", fontWeight: 600, textDecoration: "none" }}>
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Homepage() {
  const loaderData = useLoaderData();
  const [activeTab, setActiveTab] = useState("spaces");
  const [featuredListings, setFeaturedListings] = useState(loaderData?.featuredListings || []);
  const [popularListings, setPopularListings] = useState(loaderData?.popularListings || []);
  const [loadingListings, setLoadingListings] = useState(!loaderData?.featuredListings);
  const [recentBlogs, setRecentBlogs] = useState(loaderData?.recentBlogs || []);
  const [loadingBlogs, setLoadingBlogs] = useState(!loaderData?.recentBlogs);

  useEffect(() => {
    const CACHE_KEY = "vencome_homepage_listings";
    const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

    const fetchListings = async () => {
      try {
        // Load from cache first for instant display
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
              setFeaturedListings(data);
              setLoadingListings(false);
              // Still fetch fresh data in background
            }
          } catch {}
        }

        // Fetch fresh data
        const response = await fetch(`${import.meta.env.VITE_API_URL}/properties?limit=100`);
        const data = await response.json();
        const properties = data.properties || [];
        setFeaturedListings(properties);

        // Save to cache
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: properties,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchListings();
  }, []);

  // "Popular Spaces Near You" previously just reused the same unsorted
  // fetch above -- fired from the browser (not the SSR loader) so the
  // request carries the visitor's real IP for GET /properties/near-me to
  // geolocate, rather than the server's own egress IP.
  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/properties/near-me`);
        const data = await res.json();
        if (data.properties?.length) setPopularListings(data.properties);
      } catch (err) {
        console.error("Failed to fetch nearby listings:", err);
      }
    };
    fetchNearby();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/blog?limit=3`);
        const data = await res.json();
        setRecentBlogs(data.blogs || []);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
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
      <main className="bg-white text-[#111827]">
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
        <RecentBlogs blogs={recentBlogs} loading={loadingBlogs} />
        <FAQSection />
        <PlatformReviewsSection />
      </main>
      <Footer />
    </>
  );
}
