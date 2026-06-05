import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Star,
  User,
  X,
} from "lucide-react";
import { getUser } from "../utils/auth";

const getDisplayName = (user) =>
  user?.displayName ||
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
  user?.name ||
  user?.email?.split("@")[0] ||
  "User";

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

function UserInitialsAvatar({ name, size = "h-11 w-11", textSize = "text-[14px]" }) {
  return (
    <div
      className={`flex ${size} items-center justify-center rounded-full bg-[rgba(201,168,76,0.2)] font-bold text-[#F6D98B] ${textSize}`}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

const MAIN_ITEMS = [
  { label: "Overview", path: "/customer/dashboard", icon: LayoutDashboard },
  { label: "My Bookings", path: "/customer/bookings", icon: CalendarDays, badge: 2 },
  { label: "Saved Spaces", path: "/customer/saved", icon: Heart },
  { label: "Messages", path: "/customer/messages", icon: MessageSquare, badge: 3 },
  { label: "My Reviews", path: "/customer/reviews", icon: Star },
  { label: "Profile", path: "/customer/profile", icon: User },
  { label: "Settings", path: "/customer/settings", icon: Settings },
];

const QUICK_ITEMS = [
  { label: "Find a Space", path: "/search", icon: Search },
  { label: "Help & Support", path: "/support", icon: HelpCircle },
];

function SidebarContent({ pathname, onNavigate }) {
  const navigate = useNavigate();
  const currentUser = getUser();
  const displayName = getDisplayName(currentUser);
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <motion.div key={item.path} whileHover={{ x: 3 }}>
        <Link
          to={item.path}
          onClick={onNavigate}
          className={`mx-2 flex items-center gap-3 rounded-[10px] px-5 py-[11px] transition ${
            active
              ? "border-l-[3px] border-[#2E58EC] bg-white/10 pl-[17px] text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <Icon size={18} />
            {item.badge ? (
              <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#2E58EC] px-1 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </span>
          <span className="text-[14px] font-medium">{item.label}</span>
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      <div className="px-5 pb-0 pt-6">
        <Link to="/" onClick={onNavigate} className="flex items-center">
          <img
            src="/logo-blue.png"
            alt="VenCome"
            className="h-9 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </Link>
      </div>

      <div className="mx-5 mt-4 border-t border-white/10" />

      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <UserInitialsAvatar name={displayName} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-white">{displayName}</p>
            <p className="text-[12px] text-white/50">Customer</p>
            {currentUser ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#C9A84C]">
                <Check size={12} />
                Verified
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-5 pb-2 pt-1 text-[10px] font-bold tracking-[0.15em] text-white/35">
        MAIN MENU
      </div>
      <div className="space-y-1">{MAIN_ITEMS.map(renderItem)}</div>

      <div className="px-5 pb-2 pt-7 text-[10px] font-bold tracking-[0.15em] text-white/35">
        QUICK LINKS
      </div>
      <div className="space-y-1">{QUICK_ITEMS.map(renderItem)}</div>

      <div className="mt-auto px-5 pt-7">
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              console.log("logout");
              onNavigate?.();
              navigate("/");
            }}
            className="mx-2 flex w-full items-center gap-3 rounded-[10px] px-5 py-[11px] text-left text-[14px] font-medium text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

function TopBar({ title, onOpenSidebar }) {
  const currentUser = getUser();
  const displayName = getDisplayName(currentUser);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628] md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <h1 className="truncate text-[16px] font-bold text-[#0A1628] md:text-[18px]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F8F6F0]"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
        </button>
        <UserInitialsAvatar name={displayName} size="h-8 w-8" textSize="text-[12px]" />
      </div>
    </header>
  );
}

export default function CustomerLayout({ children, title }) {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F6F0]">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col overflow-y-auto bg-[#0A1628] pb-6 md:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              aria-label="Close sidebar overlay"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col overflow-y-auto bg-[#0A1628] pb-6 md:hidden"
            >
              <div className="absolute right-4 top-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
                  aria-label="Close sidebar"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} onOpenSidebar={() => setMobileOpen(true)} />
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 bg-[#F8F6F0] p-4 md:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
