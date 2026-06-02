import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  AlertCircle,
  Camera,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Grid,
  Map,
  MapPin,
  Monitor,
  Printer,
  Star,
  UserCheck,
  Wifi,
  Wind,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import Footer from "../components/Footer";

const BRAND = {
  navy: "#0A1628",
  gold: "#305CDE",
  goldDark: "#254FC7",
  bg: "#F8F6F0",
  white: "#FFFFFF",
  text: "#111827",
  mid: "#6B7280",
  border: "#E5E7EB",
};

const MOCK_PROPERTY = {
  id: "shard-executive-suite",
  title: "The Shard Executive Suite",
  location: "London Bridge, London, SE1 9SG",
  category: "Office Space",
  capacity: 24,
  rating: 4.92,
  reviewCount: 47,
  badge: "Featured",
  description: `Welcome to The Shard Executive Suite — one of London's most prestigious commercial spaces, located on the 28th floor of The Shard with panoramic views across the City, Tower Bridge, and beyond.\n\nThis fully serviced executive suite is ideal for board meetings, executive offsites, private client meetings, and high-stakes negotiations. The space comes fully equipped with state-of-the-art AV technology, a dedicated reception team, and access to a private catering service.\n\nThe suite accommodates up to 24 guests in a boardroom configuration and can be reconfigured for presentation, classroom, or networking layouts. Natural light floods the space through floor-to-ceiling glass, and the iconic London skyline provides an unforgettable backdrop for any professional event.`,
  images: [
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  ],
  amenities: [
    { label: "High-Speed WiFi", icon: "Wifi" },
    { label: "AV Equipment", icon: "Monitor" },
    { label: "Air Conditioning", icon: "Wind" },
    { label: "Reception Service", icon: "UserCheck" },
    { label: "Catering Available", icon: "Coffee" },
    { label: "Parking (nearby)", icon: "Car" },
    { label: "Disabled Access", icon: "Accessibility" },
    { label: "CCTV Security", icon: "Camera" },
    { label: "24/7 Access", icon: "Clock" },
    { label: "Printing/Copying", icon: "Printer" },
  ],
  pricing: [
    { unit: "hour", price: 85, label: "Per Hour", min: "1 hour minimum" },
    { unit: "day", price: 580, label: "Per Day", min: "Full day (9am-6pm)" },
    { unit: "week", price: 2400, label: "Per Week", min: "Mon-Fri included" },
    { unit: "month", price: 7800, label: "Per Month", min: "Rolling monthly" },
  ],
  host: {
    name: "James Thornton",
    company: "Shard Commercial Properties Ltd",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    verified: true,
    responseRate: 98,
    responseTime: "within 1 hour",
    joinedYear: 2021,
    totalListings: 4,
  },
  reviews: [
    {
      id: 1,
      author: "Sarah M.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80",
      rating: 5,
      date: "March 2026",
      text: "Absolutely stunning space. The views alone are worth it. Our client was incredibly impressed and the reception team were professional throughout. Will book again for our next quarterly review.",
    },
    {
      id: 2,
      author: "Ahmed K.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
      rating: 5,
      date: "February 2026",
      text: "Perfect for our board meeting. AV setup was flawless, the catering was excellent, and James was very responsive to all our questions. The space is even better in person than in the photos.",
    },
    {
      id: 3,
      author: "Priya S.",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&q=80",
      rating: 4,
      date: "January 2026",
      text: "Great space overall. Only minor issue was parking validation took a while to sort. The space itself is world-class and the location is unbeatable for central London.",
    },
    {
      id: 4,
      author: "Tom W.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80",
      rating: 5,
      date: "December 2025",
      text: "We used this for a full-day strategy session with 18 people. Plenty of space, great natural light, and the AV worked perfectly for our video calls with the US team. Highly recommend.",
    },
  ],
  ratingBreakdown: { 5: 38, 4: 7, 3: 2, 2: 0, 1: 0 },
  rules: [
    "No smoking anywhere in the building",
    "Catering must be pre-arranged 48hrs in advance",
    "Maximum 24 guests at any time",
    "Access via reception — photo ID required",
    "Cancellation: 72 hours notice for full refund",
  ],
  location_detail: {
    lat: 51.5045,
    lng: -0.0865,
    description:
      "Located in The Shard, London Bridge Street, SE1 9SG. 2 minutes walk from London Bridge Station (Jubilee & Northern lines, National Rail). Nearest parking: Q-Park London Bridge.",
  },
};

const SIMILAR_SPACES = [
  {
    id: 2,
    title: "Canary Wharf Boardroom",
    location: "Canary Wharf, London",
    category: "Meeting Rooms",
    price: 120,
    priceUnit: "hour",
    rating: 4.85,
    reviewCount: 31,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80",
  },
  {
    id: 10,
    title: "Mayfair Private Members Office",
    location: "Mayfair, London",
    category: "Office Space",
    price: 5500,
    priceUnit: "month",
    rating: 4.95,
    reviewCount: 12,
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
  },
  {
    id: 7,
    title: "Birmingham Conference Centre",
    location: "Digbeth, Birmingham",
    category: "Meeting Rooms",
    price: 90,
    priceUnit: "hour",
    rating: 4.6,
    reviewCount: 33,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&q=80",
  },
];

const ICON_MAP = {
  Wifi,
  Monitor,
  Wind,
  UserCheck,
  Coffee,
  Car,
  Accessibility,
  Camera,
  Clock,
  Printer,
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const SECTION_REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" },
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (firstDate, secondDate) =>
  Boolean(
    firstDate &&
      secondDate &&
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
  );

const formatCurrency = (value) =>
  `£${new Intl.NumberFormat("en-GB").format(Math.round(value))}`;

const formatDateLabel = (date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getDayDifferenceInclusive = (startDate, endDate) =>
  Math.round((startOfDay(endDate) - startOfDay(startDate)) / 86400000) + 1;

const createMonthDays = (visibleMonth) => {
  const firstDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1
  );
  const lastDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0
  );

  const leading = Array.from({ length: firstDay.getDay() }, (_, index) => ({
    key: `leading-${index}`,
    date: null,
  }));

  const current = Array.from({ length: lastDay.getDate() }, (_, index) => ({
    key: `day-${index + 1}`,
    date: new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      index + 1
    ),
  }));

  const trailingCount = (7 - ((leading.length + current.length) % 7)) % 7;
  const trailing = Array.from({ length: trailingCount }, (_, index) => ({
    key: `trailing-${index}`,
    date: null,
  }));

  return [...leading, ...current, ...trailing];
};

const isBetweenDates = (date, startDate, endDate) =>
  Boolean(
    date &&
      startDate &&
      endDate &&
      startOfDay(date) > startOfDay(startDate) &&
      startOfDay(date) < startOfDay(endDate)
  );

const hasBlockedDates = (startDate, endDate, unavailableSet) => {
  const cursor = new Date(startDate);
  cursor.setDate(cursor.getDate() + 1);

  while (startOfDay(cursor) < startOfDay(endDate)) {
    const key = cursor.toDateString();
    if (unavailableSet.has(key)) {
      return true;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return false;
};

const getBookingMetrics = (tier, selectedDays) => {
  if (!selectedDays || !tier) {
    return { units: 0, label: "", subtotal: 0 };
  }

  if (tier.unit === "hour") {
    const units = selectedDays * 8;
    return { units, label: `${units} hours`, subtotal: units * tier.price };
  }

  if (tier.unit === "day") {
    return {
      units: selectedDays,
      label: `${selectedDays} day${selectedDays > 1 ? "s" : ""}`,
      subtotal: selectedDays * tier.price,
    };
  }

  if (tier.unit === "week") {
    const units = Math.max(1, Math.ceil(selectedDays / 7));
    return { units, label: `${units} week${units > 1 ? "s" : ""}`, subtotal: units * tier.price };
  }

  const units = Math.max(1, Math.ceil(selectedDays / 30));
  return {
    units,
    label: `${units} month${units > 1 ? "s" : ""}`,
    subtotal: units * tier.price,
  };
};

export default function PropertyDetails() {
  const { id } = useParams();
  const property = MOCK_PROPERTY;
  const today = startOfDay(new Date());

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState(1);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [selectedPricingTier, setSelectedPricingTier] = useState(0);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [capacity, setCapacity] = useState(8);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [showAllReviews, setShowAllReviews] = useState(false);

  const bookingSidebarRef = useRef(null);
  const calendarRef = useRef(null);

  const selectedTier = property.pricing[selectedPricingTier];

  const unavailableDates = useMemo(() => {
    const blockedDays = [3, 8, 9, 15, 22, 23];
    return new Set(
      blockedDays.map((day) =>
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day).toDateString()
      )
    );
  }, [visibleMonth]);

  const calendarDays = useMemo(() => createMonthDays(visibleMonth), [visibleMonth]);

  const selectedDays = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    return getDayDifferenceInclusive(selectedStartDate, selectedEndDate);
  }, [selectedStartDate, selectedEndDate]);

  const bookingMetrics = useMemo(
    () => getBookingMetrics(selectedTier, selectedDays),
    [selectedTier, selectedDays]
  );

  const cleaningFee = selectedDays ? 45 : 0;
  const platformFee = selectedDays ? Math.round(bookingMetrics.subtotal * 0.1) : 0;
  const bookingTotal = bookingMetrics.subtotal + cleaningFee + platformFee;

  const displayedReviews = showAllReviews
    ? property.reviews
    : property.reviews.slice(0, 2);

  const reviewPercentages = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: property.ratingBreakdown[score],
    percentage: Math.round(
      ((property.ratingBreakdown[score] || 0) / property.reviewCount) * 100
    ),
  }));

  const openImage = (index) => {
    setLightboxDirection(index >= activeImageIndex ? 1 : -1);
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const changeImage = (direction) => {
    setLightboxDirection(direction);
    setActiveImageIndex((current) => {
      const total = property.images.length;
      return (current + direction + total) % total;
    });
  };

  const focusCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const focusBooking = () => {
    bookingSidebarRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDateSelect = (date) => {
    const normalizedDate = startOfDay(date);
    const isUnavailable = unavailableDates.has(normalizedDate.toDateString());
    const isPast = normalizedDate < today;

    if (isUnavailable || isPast) return;

    if (!selectedStartDate || selectedEndDate) {
      setSelectedStartDate(normalizedDate);
      setSelectedEndDate(null);
      return;
    }

    if (normalizedDate < selectedStartDate) {
      setSelectedStartDate(normalizedDate);
      return;
    }

    if (hasBlockedDates(selectedStartDate, normalizedDate, unavailableDates)) {
      setSelectedStartDate(normalizedDate);
      setSelectedEndDate(null);
      return;
    }

    setSelectedEndDate(normalizedDate);
  };

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews((current) => ({
      ...current,
      [reviewId]: !current[reviewId],
    }));
  };

  const sectionProps = (delay = 0) => ({
    ...SECTION_REVEAL,
    transition: { ...SECTION_REVEAL.transition, delay },
  });

  return (
    <>
      <Navbar />

      <div className="min-h-screen overflow-x-hidden bg-[#F8F6F0] pb-24 md:pb-0">
        <PhotoGallery
          images={property.images}
          onOpen={openImage}
          onShowAll={() => openImage(0)}
        />

        <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-12">
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.95fr)] lg:gap-16">
            <div className="min-w-0">
              <motion.section {...sectionProps(0)}>
                <TitleBlock property={property} />
              </motion.section>

              <motion.section {...sectionProps(0.05)}>
                <HostSection host={property.host} />
              </motion.section>

              <motion.section {...sectionProps(0.1)}>
                <DescriptionSection
                  description={property.description}
                  expanded={expandedDescription}
                  onToggle={() => setExpandedDescription((current) => !current)}
                />
              </motion.section>

              <motion.section {...sectionProps(0.15)}>
                <AmenitiesSection amenities={property.amenities} />
              </motion.section>

              <motion.section {...sectionProps(0.2)}>
                <PricingSection
                  pricing={property.pricing}
                  selectedPricingTier={selectedPricingTier}
                  onSelectTier={setSelectedPricingTier}
                />
              </motion.section>

              <motion.section ref={calendarRef} {...sectionProps(0.25)}>
                <AvailabilitySection
                  visibleMonth={visibleMonth}
                  onMonthChange={setVisibleMonth}
                  calendarDays={calendarDays}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  unavailableDates={unavailableDates}
                  onDateSelect={handleDateSelect}
                  today={today}
                  selectedDays={selectedDays}
                  availabilityTotal={bookingMetrics.subtotal}
                />
              </motion.section>

              <motion.section {...sectionProps(0.3)}>
                <HouseRulesSection rules={property.rules} />
              </motion.section>

              <motion.section {...sectionProps(0.35)}>
                <LocationSection property={property} />
              </motion.section>

              <motion.section id="reviews" {...sectionProps(0.4)}>
                <ReviewsSection
                  property={property}
                  displayedReviews={displayedReviews}
                  showAllReviews={showAllReviews}
                  onToggleShowAll={() => setShowAllReviews((current) => !current)}
                  expandedReviews={expandedReviews}
                  onToggleReview={toggleReviewExpansion}
                  reviewPercentages={reviewPercentages}
                />
              </motion.section>
            </div>

            <motion.aside
              ref={bookingSidebarRef}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="lg:self-start"
            >
              <BookingSidebar
                property={property}
                pricing={property.pricing}
                selectedTier={selectedTier}
                selectedPricingTier={selectedPricingTier}
                onSelectTier={setSelectedPricingTier}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                onFocusCalendar={focusCalendar}
                capacity={capacity}
                onCapacityChange={setCapacity}
                bookingMetrics={bookingMetrics}
                cleaningFee={cleaningFee}
                platformFee={platformFee}
                bookingTotal={bookingTotal}
              />
            </motion.aside>
          </div>
        </div>

        <SimilarSpaces spaces={SIMILAR_SPACES} />
        <Footer />

        <MobileBookingBar
          selectedTier={selectedTier}
          rating={property.rating}
          onBookNow={focusBooking}
        />
      </div>

      <Lightbox
        images={property.images}
        activeImageIndex={activeImageIndex}
        direction={lightboxDirection}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onChangeImage={changeImage}
      />
    </>
  );
}

function PhotoGallery({ images, onOpen, onShowAll }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-24 md:px-6 md:pt-28">
      <div className="relative overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={onShowAll}
          className="absolute bottom-4 right-4 z-10 hidden items-center gap-2 rounded-lg border border-[#111827] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] shadow-sm md:inline-flex"
        >
          <Grid size={16} />
          <span>Show all photos</span>
        </button>

        <div className="md:hidden">
          <button
            type="button"
            onClick={() => onOpen(0)}
            className="block h-[260px] w-full"
          >
            <img
              src={images[0]}
              alt="Property hero"
              className="h-full w-full object-cover"
            />
          </button>
        </div>

        <div className="hidden grid-cols-[2fr_1fr_1fr] grid-rows-[240px_240px] gap-1.5 md:grid">
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            onClick={() => onOpen(0)}
            className="row-span-2 overflow-hidden"
          >
            <img
              src={images[0]}
              alt="Property view 1"
              className="h-full w-full object-cover"
            />
          </motion.button>

          {images.slice(1).map((image, index) => (
            <motion.button
              key={image}
              type="button"
              whileHover={{ scale: 1.03 }}
              onClick={() => onOpen(index + 1)}
              className={`overflow-hidden ${
                index === 1 ? "rounded-tr-[12px]" : ""
              } ${index === 3 ? "rounded-br-[12px]" : ""}`}
            >
              <img
                src={image}
                alt={`Property view ${index + 2}`}
                className="h-full w-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TitleBlock({ property }) {
  const scrollToReviews = () => {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="border-b border-[#E5E7EB] pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-[#0A1628] px-2.5 py-1 text-[11px] font-semibold text-white">
          {property.category}
        </span>
        {property.host.verified ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12px] font-medium text-[#0A1628]">
            <Check size={14} className="text-[#305CDE]" />
            Verified host
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 text-[clamp(22px,5vw,32px)] font-extrabold leading-tight text-[#0A1628]">
        {property.title}
      </h1>

      <div className="mt-4 flex flex-col gap-3 text-sm text-[#6B7280] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#6B7280]" />
          <span className="text-[15px]">{property.location}</span>
        </div>

        <div className="flex items-center gap-2 text-[15px]">
          <Star size={16} className="fill-[#305CDE] text-[#305CDE]" />
          <span className="font-semibold text-[#111827]">{property.rating}</span>
          <button
            type="button"
            onClick={scrollToReviews}
            className="text-[#6B7280] underline-offset-4 transition hover:text-[#0A1628] hover:underline"
          >
            ({property.reviewCount} reviews)
          </button>
        </div>
      </div>
    </div>
  );
}

function HostSection({ host }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={host.avatar}
              alt={host.name}
              className="h-14 w-14 rounded-full object-cover"
            />
            {host.verified ? (
              <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#305CDE] text-white shadow-sm">
                <Check size={12} />
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-[16px] font-bold text-[#0A1628]">{host.name}</p>
            <p className="text-[13px] text-[#6B7280]">{host.company}</p>
            <p className="mt-2 text-[12px] leading-6 text-[#6B7280]">
              {host.responseRate}% response rate · Responds {host.responseTime} ·
              Hosting since {host.joinedYear}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="min-h-[44px] w-full rounded-lg border-[1.5px] border-[#0A1628] px-5 py-2.5 text-[13px] font-semibold text-[#0A1628] transition hover:bg-[#0A1628] hover:text-white md:w-auto"
        >
          Contact Host
        </button>
      </div>
    </div>
  );
}

function DescriptionSection({ description, expanded, onToggle }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">About This Space</h2>

      <motion.div
        layout
        animate={{ maxHeight: expanded ? 1000 : 80 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden"
      >
        <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[#374151]">
          {description}
        </p>
      </motion.div>

      <button
        type="button"
        onClick={onToggle}
        className="mt-4 text-[14px] font-semibold text-[#305CDE]"
      >
        {expanded ? "Show less ▲" : "Show more ▼"}
      </button>
    </div>
  );
}

function AmenitiesSection({ amenities }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">What's Included</h2>

      <div className="mt-5 grid grid-cols-2 gap-[10px] md:gap-3">
        {amenities.map((amenity) => {
          const Icon = ICON_MAP[amenity.icon];
          return (
            <div
              key={amenity.label}
              className="flex items-center gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(10,22,40,0.06)] text-[#0A1628]">
                <Icon size={20} />
              </span>
              <span className="text-[14px] font-medium text-[#111827]">
                {amenity.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PricingSection({ pricing, selectedPricingTier, onSelectTier }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">Pricing Options</h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {pricing.map((tier, index) => {
          const selected = selectedPricingTier === index;

          return (
            <button
              key={tier.unit}
              type="button"
              onClick={() => onSelectTier(index)}
              className={`rounded-xl border p-3 text-left transition md:p-[18px] ${
                selected
                  ? "border-[#0A1628] shadow-[0_0_0_2px_#0A1628]"
                  : "border-[#E5E7EB] bg-white"
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#6B7280]">
                {tier.label}
              </p>
              <p className="mt-3 text-[26px] font-extrabold text-[#0A1628]">
                {formatCurrency(tier.price)}
                <span className="ml-1 text-[14px] font-normal text-[#6B7280]">
                  / {tier.unit}
                </span>
              </p>
              <p className="mt-1 text-[12px] text-[#6B7280]">{tier.min}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AvailabilitySection({
  visibleMonth,
  onMonthChange,
  calendarDays,
  selectedStartDate,
  selectedEndDate,
  unavailableDates,
  onDateSelect,
  today,
  selectedDays,
  availabilityTotal,
}) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">Availability</h2>
      <p className="mt-1 text-[13px] text-[#6B7280]">Select your dates</p>

      <div className="mt-5 rounded-[18px] border border-[#E5E7EB] bg-white p-4">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628]"
          >
            <ChevronLeft size={18} />
          </button>

          <h3 className="text-[18px] font-bold text-[#0A1628]">
            {visibleMonth.toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628]"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[12px] font-medium text-[#6B7280]">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="py-2">
              {label}
            </span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {calendarDays.map((item) => {
            if (!item.date) {
              return <span key={item.key} className="h-10 w-10" />;
            }

            const date = startOfDay(item.date);
            const unavailable = unavailableDates.has(date.toDateString());
            const past = date < today;
            const isStart = isSameDay(date, selectedStartDate);
            const isEnd = isSameDay(date, selectedEndDate);
            const inRange = isBetweenDates(date, selectedStartDate, selectedEndDate);
            const isToday = isSameDay(date, today);

            const rangeClasses = isStart && isEnd
              ? "rounded-full bg-[#0A1628] text-white"
              : isStart
              ? "rounded-l-full rounded-r-none bg-[#0A1628] text-white"
              : isEnd
              ? "rounded-r-full rounded-l-none bg-[#0A1628] text-white"
              : inRange
              ? "rounded-none bg-[rgba(10,22,40,0.08)] text-[#111827]"
              : unavailable
              ? "rounded-full bg-[#F3F4F6] text-[#D1D5DB] line-through"
              : "rounded-full bg-white text-[#111827] hover:bg-[#F8F6F0]";

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onDateSelect(date)}
                disabled={unavailable || past}
                className={`flex h-10 w-10 items-center justify-center text-[14px] transition ${rangeClasses} ${
                  past ? "cursor-not-allowed opacity-35" : ""
                } ${isToday ? "border-2 border-[#305CDE]" : ""}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {selectedDays > 0 ? (
          <p className="mt-5 rounded-xl bg-[#F8F6F0] px-4 py-3 text-[14px] font-medium text-[#0A1628]">
            {selectedDays} days selected — {formatCurrency(availabilityTotal)} total
          </p>
        ) : null}
      </div>
    </div>
  );
}

function HouseRulesSection({ rules }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">House Rules</h2>

      <div className="mt-5 space-y-4">
        {rules.map((rule) => (
          <div key={rule} className="flex items-start gap-3">
            <AlertCircle size={16} className="mt-1 shrink-0 text-[#305CDE]" />
            <p className="text-[14px] leading-7 text-[#111827]">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationSection({ property }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">Location</h2>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#E5E7EB]">
        <div className="flex h-[280px] flex-col items-center justify-center bg-[#0A1628] px-6 text-center text-white">
          <Map size={48} className="text-[#305CDE]" />
          <p className="mt-4 text-[18px] font-semibold">London Bridge, SE1 9SG</p>
          <p className="mt-2 text-[14px] text-white/70">
            Google Maps — backend integration phase
          </p>
        </div>
      </div>

      <p className="mt-5 text-[14px] leading-7 text-[#6B7280]">
        {property.location_detail.description}
      </p>
    </div>
  );
}

function ReviewsSection({
  property,
  displayedReviews,
  showAllReviews,
  onToggleShowAll,
  expandedReviews,
  onToggleReview,
  reviewPercentages,
}) {
  return (
    <div className="py-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[64px] font-extrabold leading-none text-[#0A1628]">
            {property.rating}
          </p>
          <p className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-[#305CDE]">
            <Star size={16} className="fill-current" />
            Exceptional
          </p>
          <p className="mt-2 text-[13px] text-[#6B7280]">
            Based on {property.reviewCount} reviews
          </p>
        </div>

        <div className="w-full max-w-[420px] space-y-3">
          {reviewPercentages.map((item) => (
            <div key={item.score} className="grid grid-cols-[36px_1fr_44px] items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[12px] text-[#111827]">
                {item.score}
                <Star size={12} color="#C9A84C" fill="#C9A84C" />
              </span>
              <div className="h-1 rounded-full bg-[#E5E7EB]">
                <div
                  className="h-1 rounded-full bg-[#0A1628]"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-right text-[12px] text-[#6B7280]">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {displayedReviews.map((review) => {
          const expanded = expandedReviews[review.id];
          const shouldToggle = review.text.length > 160;

          return (
            <div
              key={review.id}
              className="rounded-[14px] border border-[#E5E7EB] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {review.author}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[#305CDE]">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} size={14} className="fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-right text-[12px] text-[#6B7280]">{review.date}</p>
              </div>

              <p
                className={`mt-4 text-[14px] leading-7 text-[#374151] ${
                  expanded ? "" : "line-clamp-3"
                }`}
              >
                {review.text}
              </p>

              {shouldToggle ? (
                <button
                  type="button"
                  onClick={() => onToggleReview(review.id)}
                  className="mt-3 text-[13px] font-semibold text-[#305CDE]"
                >
                  {expanded ? "Read less" : "Read more"}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onToggleShowAll}
        className="mt-8 w-full rounded-[10px] border-[1.5px] border-[#0A1628] px-4 py-3 text-[14px] font-semibold text-[#0A1628] transition hover:bg-[#0A1628] hover:text-white"
      >
        {showAllReviews ? "Show fewer reviews" : `Show all ${property.reviewCount} reviews`}
      </button>
    </div>
  );
}

function BookingSidebar({
  property,
  pricing,
  selectedTier,
  selectedPricingTier,
  onSelectTier,
  selectedStartDate,
  selectedEndDate,
  onFocusCalendar,
  capacity,
  onCapacityChange,
  bookingMetrics,
  cleaningFee,
  platformFee,
  bookingTotal,
}) {
  return (
    <div className="lg:sticky lg:top-[100px] rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[28px] font-extrabold text-[#0A1628]">
            {formatCurrency(selectedTier.price)}
            <span className="ml-1 text-[15px] font-normal text-[#6B7280]">
              / {selectedTier.unit}
            </span>
          </p>
        </div>

        <div className="text-right text-[13px] text-[#6B7280]">
          <p className="inline-flex items-center gap-1">
            <Star size={14} className="fill-[#305CDE] text-[#305CDE]" />
            <span className="font-semibold text-[#111827]">{property.rating}</span>
            <span>· {property.reviewCount} reviews</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {pricing.map((tier, index) => {
          const selected = selectedPricingTier === index;
          return (
            <button
              key={tier.unit}
              type="button"
              onClick={() => onSelectTier(index)}
              className={`rounded-full px-3 py-2 text-[12px] font-semibold transition ${
                selected
                  ? "bg-[#0A1628] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#111827]"
              }`}
            >
              {tier.unit}
            </button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-[18px] border border-[#E5E7EB]">
        <div className="grid grid-cols-2 divide-x divide-[#E5E7EB]">
          {[
            { label: "Check-in", value: selectedStartDate },
            { label: "Check-out", value: selectedEndDate },
          ].map((field) => (
            <button
              key={field.label}
              type="button"
              onClick={onFocusCalendar}
              className="px-4 py-3 text-left"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0A1628]">
                {field.label}
              </p>
              <p className={`mt-1 text-[14px] ${field.value ? "text-[#111827]" : "text-[#6B7280]"}`}>
                {field.value ? formatDateLabel(field.value) : "Add date"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-[#E5E7EB] px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0A1628]">
          Capacity
        </p>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onCapacityChange(Math.max(1, capacity - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628]"
          >
            -
          </button>
          <div className="text-center">
            <p className="text-[18px] font-semibold text-[#111827]">{capacity}</p>
            <p className="text-[12px] text-[#6B7280]">people / workstations</p>
          </div>
          <button
            type="button"
            onClick={() => onCapacityChange(Math.min(property.capacity, capacity + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628]"
          >
            +
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {selectedStartDate && selectedEndDate ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 space-y-3 text-[14px] text-[#111827]"
          >
            <div className="flex items-center justify-between">
              <span>
                {formatCurrency(selectedTier.price)} × {bookingMetrics.label}
              </span>
              <span>{formatCurrency(bookingMetrics.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cleaning fee</span>
              <span>{formatCurrency(cleaningFee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Platform fee</span>
              <span>{formatCurrency(platformFee)}</span>
            </div>
            <div className="border-t border-[#E5E7EB] pt-3">
              <div className="flex items-center justify-between text-[16px] font-bold">
                <span>Total</span>
                <span>{formatCurrency(bookingTotal)}</span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        className="mt-6 w-full rounded-[10px] bg-[#305CDE] px-5 py-4 text-[16px] font-bold text-white transition hover:bg-[#254FC7]"
      >
        Book Instantly
      </button>

      <button
        type="button"
        className="mt-3 w-full rounded-[10px] border-[1.5px] border-[#0A1628] bg-white px-5 py-4 text-[16px] font-semibold text-[#0A1628] transition hover:bg-[#0A1628] hover:text-white"
      >
        Send Enquiry
      </button>

      <p className="mt-3 text-center text-[12px] text-[#6B7280]">
        You won't be charged yet
      </p>

      <button
        type="button"
        className="mt-4 w-full text-center text-[12px] text-[#6B7280] transition hover:underline"
      >
        Report this listing
      </button>
    </div>
  );
}

function SimilarSpaces({ spaces }) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-4 md:px-6">
      <h2 className="text-[24px] font-bold text-[#0A1628]">
        Similar Spaces You Might Like
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {spaces.map((space, index) => (
          <motion.div
            key={space.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
          >
            <PropertyCard
              id={space.id}
              image={space.image}
              title={space.title}
              location={space.location}
              category={space.category}
              price={space.price}
              priceUnit={space.priceUnit}
              rating={space.rating}
              reviewCount={space.reviewCount}
              badge={space.badge}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MobileBookingBar({ selectedTier, rating, onBookNow }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#E5E7EB] bg-white px-5 py-3 md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[14px] font-bold text-[#0A1628] md:text-[16px]">
            {formatCurrency(selectedTier.price)}
            <span className="ml-1 text-[13px] font-normal text-[#6B7280]">
              / {selectedTier.unit}
            </span>
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-[#6B7280]">
            <Star size={13} className="fill-[#305CDE] text-[#305CDE]" />
            {rating}
          </p>
        </div>

        <button
          type="button"
          onClick={onBookNow}
          className="min-h-[44px] rounded-lg bg-[#305CDE] px-4 py-2.5 text-[14px] font-semibold text-white md:px-5"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

const LIGHTBOX_VARIANTS = {
  enter: (dir) => ({ x: dir * 300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -300, opacity: 0 }),
};

function Lightbox({ images, activeImageIndex, direction, isOpen, onClose, onChangeImage }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] bg-black/90"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-20 text-white"
          >
            <X size={28} />
          </button>

          <button
            type="button"
            onClick={() => onChangeImage(-1)}
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm md:left-4 md:h-12 md:w-12"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            type="button"
            onClick={() => onChangeImage(1)}
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm md:right-4 md:h-12 md:w-12"
          >
            <ChevronRight size={32} />
          </button>

          <div className="flex h-full items-center justify-center px-6">
            <AnimatePresence mode="wait">
              <motion.img
                key={images[activeImageIndex]}
                custom={direction}
                src={images[activeImageIndex]}
                alt={`Property image ${activeImageIndex + 1}`}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 80) onChangeImage(-1);
                  if (info.offset.x < -80) onChangeImage(1);
                }}
                variants={LIGHTBOX_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              />
            </AnimatePresence>
          </div>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[14px] text-white">
            {activeImageIndex + 1} / {images.length}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
