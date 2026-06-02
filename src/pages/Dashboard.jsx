import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Heart,
  HelpCircle,
  MapPin,
  MessageSquare,
  Plus,
  PoundSterling,
  Search,
  Star,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import PropertyCard from "../components/PropertyCard";
import { getUser } from "../utils/auth";

const UPCOMING = [
  {
    id: 1,
    space: "Canary Wharf Boardroom",
    location: "Canary Wharf, London",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=200&q=80",
    checkIn: "Mon 19 May 2026",
    checkOut: "Mon 19 May 2026",
    duration: "9:00am – 1:00pm (4 hours)",
    price: "£480",
    status: "Confirmed",
    bookingRef: "VC-2024-001",
  },
  {
    id: 2,
    space: "DIFC Creative Studio",
    location: "DIFC, Dubai",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&q=80",
    checkIn: "Fri 23 May 2026",
    checkOut: "Fri 23 May 2026",
    duration: "Full day (9am – 6pm)",
    price: "£250",
    status: "Pending",
    bookingRef: "VC-2024-002",
  },
];

const RECENT = [
  { id: 5, title: "Shoreditch Event Space", location: "Shoreditch, London", category: "Event Venues", price: 450, priceUnit: "day", rating: 4.9, reviewCount: 58, badge: "Popular", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80" },
  { id: 10, title: "Mayfair Private Members Office", location: "Mayfair, London", category: "Office Space", price: 5500, priceUnit: "month", rating: 4.95, reviewCount: 12, badge: "Featured", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80" },
  { id: 3, title: "DIFC Creative Studio", location: "DIFC, Dubai", category: "Studio Space", price: 250, priceUnit: "day", rating: 4.97, reviewCount: 22, badge: "Verified", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80" },
  { id: 9, title: "Abu Dhabi Business Hub", location: "Al Maryah Island, Abu Dhabi", category: "Co-working", price: 180, priceUnit: "day", rating: 4.72, reviewCount: 41, badge: "Verified", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" },
];

const STATS = [
  { icon: CalendarDays, label: "Upcoming Bookings", value: "2", sub: "Next: Mon 19 May" },
  { icon: Heart, label: "Saved Spaces", value: "14", sub: "3 new matches" },
  { icon: MessageSquare, label: "Unread Messages", value: "3", sub: "2 from hosts" },
  { icon: PoundSterling, label: "Total Spent", value: "£4,820", sub: "This year", trend: "+12% vs last year" },
];

const ACTIONS = [
  { icon: Plus, title: "List Your Space", description: "Start earning from your property", href: "/create-space" },
  { icon: MessageSquare, title: "Messages", description: "3 unread conversations", href: "/dashboard/messages" },
  { icon: Heart, title: "Saved Spaces", description: "14 spaces saved", href: "/dashboard/saved" },
  { icon: Star, title: "Leave a Review", description: "2 bookings awaiting review", href: "/dashboard/reviews" },
  { icon: HelpCircle, title: "Help & Support", description: "Get answers instantly", href: "/help-support" },
];

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const numericTarget = Number(target) || 0;
    const step = numericTarget / (duration / 16);
    const timer = window.setInterval(() => {
      start += step;
      if (start >= numericTarget) {
        setCount(numericTarget);
        window.clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => window.clearInterval(timer);
  }, [duration, target]);

  return count;
}

function StatusBadge({ status }) {
  const styles =
    status === "Confirmed"
      ? "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
      : "border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] text-[#D97706]";

  return (
    <span className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${styles}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const currentUser = getUser();
  const displayName = currentUser?.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
    : currentUser?.email?.split("@")[0] || "there";
  const upcomingCount = useCountUp(2);
  const savedCount = useCountUp(14);
  const unreadCount = useCountUp(3);
  const spentCount = useCountUp(4820);

  const liveStats = [
    { ...STATS[0], value: `${upcomingCount}` },
    { ...STATS[1], value: `${savedCount}` },
    { ...STATS[2], value: `${unreadCount}` },
    { ...STATS[3], value: `£${new Intl.NumberFormat("en-GB").format(spentCount)}` },
  ];

  return (
    <DashboardLayout title="Overview">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-7 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0A1628_0%,#1a2f4e_100%)] px-4 py-5 sm:px-6 md:px-8 md:py-7"
      >
        <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-[200px] w-[200px] rounded-full bg-[rgba(48,92,222,0.1)]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-white md:text-[22px]">Good morning, {displayName}</h2>
            <p className="mt-1.5 text-[14px] text-white/70">
              You have 2 upcoming bookings this week.
            </p>
          </div>
          <Link
            to="/search"
            className="hidden rounded-lg border-[1.5px] border-[#305CDE] px-5 py-2.5 text-[14px] font-semibold text-[#305CDE] transition hover:bg-[rgba(48,92,222,0.1)] md:inline-flex"
          >
            Explore Spaces →
          </Link>
        </div>
      </motion.section>

      <section className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {liveStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-4 sm:px-5 sm:py-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(48,92,222,0.2)] bg-[rgba(48,92,222,0.1)] text-[#305CDE]">
                <Icon size={20} />
              </div>
              <p className="mt-4 text-[13px] text-[#6B7280]">{stat.label}</p>
              <p className="mt-1 break-words text-[24px] font-extrabold text-[#0A1628] sm:text-[28px]">{stat.value}</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">{stat.sub}</p>
              {stat.trend ? (
                <p className="mt-1 text-[12px] font-medium text-[#16A34A]">{stat.trend}</p>
              ) : null}
            </motion.div>
          );
        })}
      </section>

      <section className="mb-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-[18px] font-bold text-[#0A1628]">Upcoming Bookings</h3>
          <Link to="/dashboard/bookings" className="text-[14px] font-medium text-[#305CDE]">
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {UPCOMING.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
                className="flex flex-col gap-4 rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-4 md:flex-row md:items-center md:px-5"
            >
              <img
                src={booking.image}
                alt={booking.space}
                  className="h-14 w-14 rounded-[10px] object-cover md:h-[72px] md:w-[72px]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#0A1628]">{booking.space}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                  <MapPin size={12} />
                  <span>{booking.location}</span>
                </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#374151]">
                  <Clock size={12} />
                    <span className="whitespace-normal break-words">{booking.duration}</span>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <p className="text-[16px] font-bold text-[#0A1628]">{booking.price}</p>
                <StatusBadge status={booking.status} />
                <Link
                  to="/dashboard/bookings"
                  className="text-[13px] font-medium text-[#305CDE] hover:underline"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-[18px] font-bold text-[#0A1628]">Recently Viewed</h3>
          <Link to="/dashboard/saved" className="text-[14px] font-medium text-[#305CDE]">
            View saved →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {RECENT.map((space) => (
            <div key={space.id} className="min-w-[220px] shrink-0 sm:min-w-[260px]">
              <PropertyCard {...space} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[18px] font-bold text-[#0A1628]">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(48,92,222,0.15)" }}
              >
                <Link
                  to={action.href}
                  className="block rounded-[14px] border border-[#E5E7EB] bg-white p-4 transition hover:border-[#305CDE] sm:p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(48,92,222,0.2)] bg-[rgba(48,92,222,0.1)] text-[#305CDE]">
                    <Icon size={20} />
                  </div>
                  <p className="mt-3 text-[14px] font-bold text-[#0A1628]">{action.title}</p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">{action.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </DashboardLayout>
  );
}
