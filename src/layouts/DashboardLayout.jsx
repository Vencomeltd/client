import { createContext, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart2,
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
  Plus,
  Settings,
  Star,
  User,
  X,
} from "lucide-react";
import { getUser } from "../utils/auth";
import { isNavGuardActive, requestNavConfirm, getNavGuardHandler } from "../utils/navGuard";

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
      className={`flex ${size} items-center justify-center rounded-full bg-[rgba(48,92,222,0.18)] font-bold text-[#9FB5FF] ${textSize}`}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export const DashboardBadgeContext = createContext({
  clearPendingCount: () => {},
  clearUnreadCount: () => {},
});

export const useDashboardBadge = () => useContext(DashboardBadgeContext);

const getMainItems = (pendingCount, unreadCount, isHost) => [
  { label: "Overview", path: isHost ? "/dashboard" : "/customer/dashboard", icon: LayoutDashboard },
  { label: "My Bookings", path: isHost ? "/dashboard/bookings" : "/customer/bookings", icon: CalendarDays, badge: pendingCount > 0 ? pendingCount : null },
  { label: "Saved Spaces", path: isHost ? "/dashboard/saved" : "/customer/saved", icon: Heart },
  { label: "Messages", path: isHost ? "/dashboard/messages" : "/customer/messages", icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : null },
  { label: "My Reviews", path: isHost ? "/dashboard/reviews" : "/customer/reviews", icon: Star },
  { label: "Profile", path: isHost ? "/dashboard/profile" : "/customer/profile", icon: User },
  { label: "Settings", path: isHost ? "/dashboard/settings" : "/customer/settings", icon: Settings },
];

const HOSTING_ITEMS = [
  { label: "My Listings", path: "/host/listings", icon: Building2 },
  { label: "Calendar", path: "/host/calendar", icon: CalendarDays },
  { label: "Add New Space", path: "/host/create", icon: Plus },
  { label: "Analytics", path: "/host/analytics", icon: BarChart2 },
];

function SidebarContent({ pathname, onNavigate, mainItems }) {
  const currentUser = getUser();
  const displayName = getDisplayName(currentUser);
  const roleLabel = currentUser?.isHost ? "Host" : "Member";
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);
  const handleLogout = () => {
    localStorage.removeItem("vencome_token");
    localStorage.removeItem("vencome_refresh");
    localStorage.removeItem("vencome_user");
    window.location.href = "/";
  };

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <motion.div whileHover={{ x: 3 }}>
      <Link
        key={item.path}
        to={item.path}
        onClick={(e) => {
          if (isNavGuardActive()) {
            e.preventDefault();
            requestNavConfirm();
            return;
          }
          onNavigate?.();
        }}
        className={`mx-2 flex items-center gap-3 rounded-[10px] px-[17px] py-[11px] transition ${
          active
            ? "border-l-[3px] border-[#305CDE] bg-white/10 pl-[14px] text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Icon size={18} />
          {item.badge ? (
            <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#305CDE] px-1 text-[10px] font-bold text-white">
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
        <Link
          to="/"
          onClick={(e) => {
            if (isNavGuardActive()) {
              e.preventDefault();
              requestNavConfirm();
              return;
            }
            onNavigate?.();
          }}
          className="flex items-center gap-3 text-white"
        >
          <img
            src="/logo-blue.png"
            alt="VenCome"
            style={{
              height: 36,
              width: "auto",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
            }}
          />
        </Link>
      </div>

      <div className="mx-5 mt-5 border-t border-white/10" />

      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <UserInitialsAvatar name={displayName} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-white">{displayName}</p>
            <p className="text-[12px] text-white/50">{roleLabel}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[rgba(48,92,222,0.3)] bg-[rgba(48,92,222,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#305CDE]">
              <Check size={12} />
              Verified
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-2 pt-1 text-[10px] font-bold tracking-[0.15em] text-white/35">
        MAIN MENU
      </div>
      <div className="space-y-1">{mainItems.map(renderItem)}</div>

      {currentUser?.isHost ? (
        <>
          <div className="px-5 pb-2 pt-6 text-[10px] font-bold tracking-[0.15em] text-white/35">
            HOSTING
          </div>
          <div className="space-y-1">{HOSTING_ITEMS.map(renderItem)}</div>
        </>
      ) : null}

      <div className="mt-auto px-5 pt-6">
        <div className="border-t border-white/10 pt-4">
          <Link
            to="/help-support"
            onClick={(e) => {
              if (isNavGuardActive()) {
                e.preventDefault();
                requestNavConfirm();
                return;
              }
              onNavigate?.();
            }}
            className="mx-[-12px] flex items-center gap-3 rounded-[10px] px-3 py-[11px] text-[14px] font-medium text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <HelpCircle size={18} />
            <span>Help & Support</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              if (isNavGuardActive()) {
                requestNavConfirm();
                return;
              }
              onNavigate?.();
              handleLogout();
            }}
            className="mx-[-12px] mt-1 flex w-full items-center gap-3 rounded-[10px] px-3 py-[11px] text-left text-[14px] font-medium text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children, title }) {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [savingAndLeaving, setSavingAndLeaving] = useState(false);
  const currentUser = getUser();
  const displayName = getDisplayName(currentUser);

  useEffect(() => {
    const handler = () => setShowLeaveModal(true);
    window.addEventListener("vencome:nav-guard-prompt", handler);
    return () => window.removeEventListener("vencome:nav-guard-prompt", handler);
  }, []);

  const handleSaveAndLeave = async () => {
    const onConfirmLeave = getNavGuardHandler();
    if (!onConfirmLeave) {
      setShowLeaveModal(false);
      return;
    }
    setSavingAndLeaving(true);
    try {
      await onConfirmLeave();
    } finally {
      setSavingAndLeaving(false);
      setShowLeaveModal(false);
    }
  };

  useEffect(() => {
    const bookingPaths = ["/customer/bookings", "/dashboard/bookings"];
    const messagePaths = ["/customer/messages", "/dashboard/messages"];

    const onBookingsPage = bookingPaths.some((p) => pathname.startsWith(p));
    const onMessagesPage = messagePaths.some((p) => pathname.startsWith(p));

    if (onBookingsPage) {
      localStorage.setItem("vencome_bookings_seen_at", Date.now().toString());
      setPendingCount(0);
    }
    if (onMessagesPage) {
      localStorage.setItem("vencome_messages_seen_at", Date.now().toString());
      setUnreadCount(0);
    }

    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem("vencome_token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const API = import.meta.env.VITE_API_URL;

        const [unreadRes, pendingRes] = await Promise.all([
          fetch(`${API}/messages/unread-count`, { headers }),
          fetch(`${API}/bookings/pending-count`, { headers }),
        ]);

        if (pendingRes.ok) {
          const data = await pendingRes.json();
          const newCount = data.pendingCount || 0;
          const seenAt = parseInt(localStorage.getItem("vencome_bookings_seen_at") || "0");
          const lastKnown = parseInt(localStorage.getItem("vencome_bookings_last_count") || "0");
          if (newCount > lastKnown) {
            const diff = newCount - lastKnown;
            localStorage.removeItem("vencome_bookings_seen_at");
            localStorage.setItem("vencome_bookings_last_count", newCount.toString());
            setPendingCount(diff);
          } else if (!seenAt) {
            setPendingCount(newCount);
          }
        }

        if (unreadRes.ok) {
          const data = await unreadRes.json();
          const newCount = data.unreadCount || 0;
          const seenAt = parseInt(localStorage.getItem("vencome_messages_seen_at") || "0");
          const lastKnown = parseInt(localStorage.getItem("vencome_messages_last_count") || "0");
          if (newCount > lastKnown) {
            const diff = newCount - lastKnown;
            localStorage.removeItem("vencome_messages_seen_at");
            localStorage.setItem("vencome_messages_last_count", newCount.toString());
            setUnreadCount(diff);
          } else if (!seenAt) {
            setUnreadCount(newCount);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sidebar counts:", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  const mainItems = getMainItems(pendingCount, unreadCount, currentUser?.isHost);

  const badgeContextValue = {
    clearPendingCount: () => setPendingCount(0),
    clearUnreadCount: () => setUnreadCount(0),
  };

  return (
    <DashboardBadgeContext.Provider value={badgeContextValue}>
    <div className="flex min-h-screen bg-[#F8F6F0]">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col overflow-y-auto bg-[#0A1628] pb-6 md:flex">
        <SidebarContent pathname={pathname} mainItems={mainItems} />
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
              <SidebarContent
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
                mainItems={mainItems}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628] md:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <h1 className="break-words text-[16px] font-bold text-[#0A1628] md:text-[18px]">{title}</h1>
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

    {showLeaveModal ? (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "420px",
            width: "90%",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0A1628", marginBottom: "10px" }}>
            Save your progress and finish later?
          </h2>
          <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6, marginBottom: "24px" }}>
            You have an unfinished listing. You can save it as a draft and pick up where you left off, or stay here and keep filling it in.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => setShowLeaveModal(false)}
              disabled={savingAndLeaving}
              style={{
                background: "transparent",
                color: "#0A1628",
                border: "1.5px solid #0A1628",
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel &amp; Stay
            </button>
            <button
              type="button"
              onClick={handleSaveAndLeave}
              disabled={savingAndLeaving}
              style={{
                background: "#0A1628",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                opacity: savingAndLeaving ? 0.7 : 1,
              }}
            >
              {savingAndLeaving ? "Saving..." : "Save as Draft & Leave"}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </DashboardBadgeContext.Provider>
  );
}
