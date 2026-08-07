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

const COUNTRY_ICON_MAP = {
  "United Kingdom": Landmark,
};

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

        // Pin Medical & Clinical and Beauty & Cosmetics to the front of the strip
        const PINNED_NAMES = ["Medical & Clinical", "Beauty & Cosmetics"];
        const pinned = PINNED_NAMES
          .map((name) => list.find((c) => c.name === name))
          .filter(Boolean);
        const rest = list.filter((c) => !PINNED_NAMES.includes(c.name));
        const reordered = [...pinned, ...rest];

        setCategories(reordered);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();

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
              (
                <div
                  key={listing.id || listing._id}
                  className="w-[260px] shrink-0 md:w-[300px]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <PropertyCard
                    id={listing._id}
                    image={listing.coverImage}
                    title={listing.title}
                    location={`${listing.location?.city || ""}, ${listing.location?.country || ""}`}
                    category={listing.category?.name || ""}
                    isLoading={listing.isLoading}
                    property={listing}
                    variant="homepage"
                  />
                </div>
              )
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
  const [countries, setCountries] = useState([]);
  const [loaded, setLoaded] = useState(false);

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
                      to={buildSearchHref({ location: city.name })}
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
                style={{ background: "#F8F6F0", borderRadius: 16, overflow: "hidden", border: "1.5px solid #E5E7EB", transition: "box-shadow 0.2s", cursor: "pointer" }}
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
      a: "VenCome is a B2B commercial space rental marketplace that connects businesses with professional spaces across the UK and Middle East. Whether you need an office for a day, a meeting room for an hour, or a studio for a week — VenCome makes it simple to find, book, and pay."
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
      a: "Payments are processed securely through Stripe. Your payment is held in escrow until after your booking is confirmed and completed. Hosts receive their payout 24–48 hours after check-in for short-term bookings."
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
      q: "Is VenCome available in the Middle East?",
      a: "Yes. VenCome operates across the UK and the Middle East, with Saudi Arabia as a priority market. More cities and regions are being added regularly."
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
  const [activeTab, setActiveTab] = useState("spaces");
  const [featuredListings, setFeaturedListings] = useState([]);
  const [popularListings, setPopularListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

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
              setFeaturedListings(data.slice(0, 4));
              setPopularListings(data.slice(0, 8));
              setLoadingListings(false);
              // Still fetch fresh data in background
            }
          } catch {}
        }

        // Fetch fresh data
        const response = await fetch(`${import.meta.env.VITE_API_URL}/properties?limit=8`);
        const data = await response.json();
        const properties = data.properties || [];
        setFeaturedListings(properties.slice(0, 4));
        setPopularListings(properties.slice(0, 8));

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
        <RecentBlogs blogs={recentBlogs} loading={loadingBlogs} />
        <FAQSection />
        <PlatformReviewsSection />
      </main>
      <Footer />
    </>
  );
}
