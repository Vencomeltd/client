import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart2,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { useNotifications } from "../context/NotificationContext";
import { TYPE_CONFIG, timeAgo } from "../utils/notificationDisplay";

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

function UserInitialsAvatar({ name, image, size = "h-11 w-11", textSize = "text-[14px]" }) {
  const hasRealImage = image && !image.includes("gravatar");
  if (hasRealImage) {
    return (
      <img
        src={image}
        alt={name}
        title={name}
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    );
  }
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
  isHost
    ? {
        label: "My Bookings",
        icon: CalendarDays,
        badge: pendingCount > 0 ? pendingCount : null,
        children: [
          { label: "Bookings for Your Space", path: "/dashboard/bookings" },
          { label: "Bookings You Made", path: "/customer/bookings" },
        ],
      }
    : { label: "My Bookings", path: "/customer/bookings", icon: CalendarDays, badge: pendingCount > 0 ? pendingCount : null },
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

function SidebarContent({ pathname, onNavigate, mainItems, collapsed = false, onToggleCollapse }) {
  const currentUser = getUser();
  const displayName = getDisplayName(currentUser);
  const roleLabel = currentUser?.isHost ? "Host" : "Member";
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);
  const handleLogout = () => {
    localStorage.removeItem("vencome_token");
    localStorage.removeItem("vencome_refresh");
    localStorage.removeItem("vencome_user");
    localStorage.removeItem("vencome_login_time");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const guardedNavigate = (e) => {
    if (isNavGuardActive()) {
      e.preventDefault();
      requestNavConfirm();
      return false;
    }
    onNavigate?.();
    return true;
  };

  // "My Bookings" for hosts expands into As Host / As Guest instead of a
  // single link — starts open if the host is already on either sub-page.
  const [expandedLabel, setExpandedLabel] = useState(() => {
    const bookingsItem = mainItems.find((item) => item.children);
    if (bookingsItem?.children?.some((child) => isActive(child.path))) {
      return bookingsItem.label;
    }
    return null;
  });

  const renderItem = (item) => {
    const Icon = item.icon;

    if (item.children) {
      const expanded = expandedLabel === item.label;
      const anyChildActive = item.children.some((child) => isActive(child.path));

      // Collapsed rail: no room for an expandable submenu, so this item
      // just links straight to its first child instead.
      if (collapsed) {
        return (
          <motion.div key={item.label} whileHover={{ x: 3 }}>
            <Link
              to={item.children[0].path}
              onClick={(e) => guardedNavigate(e)}
              title={item.label}
              className={`mx-2 flex items-center justify-center rounded-[10px] px-[17px] py-[11px] transition ${
                anyChildActive
                  ? "border-l-[3px] border-[#305CDE] bg-white/10 text-white"
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
            </Link>
          </motion.div>
        );
      }

      return (
        <div key={item.label}>
          <motion.div whileHover={{ x: 3 }}>
            <button
              type="button"
              onClick={() => setExpandedLabel(expanded ? null : item.label)}
              className={`mx-2 flex w-[calc(100%-16px)] items-center gap-3 rounded-[10px] px-[17px] py-[11px] text-left transition ${
                anyChildActive
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
              <span className="flex-1 text-[14px] font-medium">{item.label}</span>
              <ChevronDown
                size={15}
                className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </motion.div>
          {expanded ? (
            <div className="ml-[38px] mt-1 space-y-1 border-l border-white/10 pl-3">
              {item.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  onClick={(e) => guardedNavigate(e)}
                  className={`block rounded-[8px] px-3 py-2 text-[13px] font-medium transition ${
                    isActive(child.path)
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      );
    }

    const active = isActive(item.path);

    return (
      <motion.div key={item.path} whileHover={{ x: 3 }}>
      <Link
        to={item.path}
        onClick={(e) => guardedNavigate(e)}
        title={collapsed ? item.label : undefined}
        className={`mx-2 flex items-center gap-3 rounded-[10px] px-[17px] py-[11px] transition ${
          collapsed ? "justify-center" : ""
        } ${
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
        {collapsed ? null : <span className="text-[14px] font-medium">{item.label}</span>}
      </Link>
      </motion.div>
    );
  };

  return (
    <>
      <div className={`flex items-center pb-0 pt-6 ${collapsed ? "flex-col gap-3 px-3" : "justify-between px-5"}`}>
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
          {collapsed ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(201,168,76,0.2)] text-[15px] font-extrabold text-[#C9A84C]">
              V
            </span>
          ) : (
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
          )}
        </Link>
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        ) : null}
      </div>

      <div className="mx-5 mt-5 border-t border-white/10" />

      <div className={collapsed ? "flex justify-center px-3 py-4" : "px-5 py-4"}>
        <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
          <UserInitialsAvatar name={displayName} image={currentUser?.profileImage} />
          {collapsed ? null : (
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-white">{displayName}</p>
              <p className="text-[12px] text-white/50">{roleLabel}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[rgba(48,92,222,0.3)] bg-[rgba(48,92,222,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#305CDE]">
                <Check size={12} />
                Verified
              </span>
            </div>
          )}
        </div>
      </div>

      {collapsed ? null : (
        <div className="px-5 pb-2 pt-1 text-[10px] font-bold tracking-[0.15em] text-white/35">
          MAIN MENU
        </div>
      )}
      <div className="space-y-1">{mainItems.map(renderItem)}</div>

      {currentUser?.isHost ? (
        <>
          {collapsed ? (
            <div className="mx-5 mt-6 border-t border-white/10" />
          ) : (
            <div className="px-5 pb-2 pt-6 text-[10px] font-bold tracking-[0.15em] text-white/35">
              HOSTING
            </div>
          )}
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
            title={collapsed ? "Help & Support" : undefined}
            className={`mx-[-12px] flex items-center gap-3 rounded-[10px] px-3 py-[11px] text-[14px] font-medium text-white/50 transition hover:bg-white/5 hover:text-white ${collapsed ? "justify-center" : ""}`}
          >
            <HelpCircle size={18} />
            {collapsed ? null : <span>Help & Support</span>}
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
            title={collapsed ? "Log Out" : undefined}
            className={`mx-[-12px] mt-1 flex w-full items-center gap-3 rounded-[10px] px-3 py-[11px] text-left text-[14px] font-medium text-white/50 transition hover:bg-white/5 hover:text-white ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={18} />
            {collapsed ? null : <span>Log Out</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children, title }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    unreadCount: notifUnreadCount,
    notifications: notifItems,
    markRead: markNotifRead,
    markAllRead: markAllNotifsRead,
  } = useNotifications() || {};
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!notifOpen) return;
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [notifOpen]);

  const handleNotifClick = async (n) => {
    if (!n.read) await markNotifRead(n._id);
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("vencome_sidebar_collapsed") === "1"
  );
  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("vencome_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };
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
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto bg-[#0A1628] pb-6 transition-[width] duration-200 md:flex ${
          collapsed ? "w-[76px]" : "w-[260px]"
        }`}
      >
        <SidebarContent
          pathname={pathname}
          mainItems={mainItems}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
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
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F8F6F0]"
                aria-label={notifUnreadCount > 0 ? `Notifications, ${notifUnreadCount} unread` : "Notifications"}
                aria-expanded={notifOpen}
              >
                <Bell size={20} />
                {notifUnreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">
                    {notifUnreadCount > 9 ? "9+" : notifUnreadCount}
                  </span>
                ) : null}
              </button>

              <AnimatePresence>
                {notifOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-[360px] max-w-[90vw] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                  >
                    <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-3">
                      <span className="text-[14px] font-bold text-[#0A1628]">Notifications</span>
                      {notifUnreadCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => markAllNotifsRead()}
                          className="text-[12px] font-semibold text-[#2E58EC] hover:opacity-70"
                        >
                          Mark all read
                        </button>
                      ) : null}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                      {!notifItems || notifItems.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                          <Bell size={22} className="text-[#D1D5DB]" />
                          <p className="text-[13px] text-[#6B7280]">No notifications yet</p>
                        </div>
                      ) : (
                        notifItems.slice(0, 8).map((n) => {
                          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.admin_message;
                          const Icon = cfg.icon;
                          return (
                            <button
                              key={n._id}
                              type="button"
                              onClick={() => handleNotifClick(n)}
                              className={`flex w-full items-start gap-3 border-b border-[#F9FAFB] px-4 py-3 text-left transition hover:bg-[#F8F6F0] ${
                                !n.read ? "bg-[#FAFBFF]" : "bg-white"
                              }`}
                            >
                              <span
                                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                                style={{ background: `${cfg.color}1F` }}
                              >
                                <Icon size={15} color={cfg.color} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className={`block truncate text-[13px] ${!n.read ? "font-bold text-[#0A1628]" : "font-medium text-[#374151]"}`}>
                                  {n.title}
                                </span>
                                <span className="mt-0.5 block truncate text-[12px] text-[#6B7280]">{n.body}</span>
                                <span className="mt-1 block text-[11px] text-[#9CA3AF]">{timeAgo(n.createdAt)}</span>
                              </span>
                              {!n.read ? <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#2E58EC]" /> : null}
                            </button>
                          );
                        })
                      )}
                    </div>

                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block border-t border-[#F3F4F6] px-4 py-3 text-center text-[13px] font-semibold text-[#2E58EC] hover:bg-[#F8F6F0]"
                    >
                      View all notifications
                    </Link>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
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
