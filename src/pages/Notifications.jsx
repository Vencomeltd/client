import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BellRing, X } from "lucide-react";
import { apiFetch } from "../utils/api";
import { useNotifications } from "../context/NotificationContext";
import { TYPE_CONFIG, timeAgo } from "../utils/notificationDisplay";
import DashboardLayout from "../layouts/DashboardLayout";

function groupByDate(notifications) {
  const groups = {};
  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let key;
    if (d.toDateString() === today.toDateString()) key = "Today";
    else if (d.toDateString() === yesterday.toDateString()) key = "Yesterday";
    else
      key = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return groups;
}

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    fetchNotifications,
  } = useNotifications();
  const [filter, setFilter] = useState("all"); // all | unread
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const swipeRef = useRef({});

  useEffect(() => {
    loadPage(1);
  }, [filter]);

  const loadPage = async (p) => {
    setLoading(true);
    try {
      const data = await apiFetch({
        endpoint: `/notifications?page=${p}&limit=25${
          filter === "unread" ? "&unread=1" : ""
        }`,
        showErrorToast: false,
      });
      if (p === 1) setAllNotifications(data.notifications || []);
      else
        setAllNotifications((prev) => [...prev, ...(data.notifications || [])]);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  const handleClick = async (n) => {
    if (!n.read) await markRead(n._id);
    if (n.link) navigate(n.link);
    // Sync local list
    setAllNotifications((prev) =>
      prev.map((item) => (item._id === n._id ? { ...item, read: true } : item))
    );
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeleting(id);
    try {
      await apiFetch({ endpoint: `/notifications/${id}`, method: "DELETE" });
      setAllNotifications((prev) => prev.filter((n) => n._id !== id));
      setTotal((t) => t - 1);
    } catch {}
    setDeleting(null);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setAllNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered =
    filter === "unread"
      ? allNotifications.filter((n) => !n.read)
      : allNotifications;

  const grouped = groupByDate(filtered);

  return (
    <DashboardLayout title="Notifications">
    <div className="notifications-page">
      <div className="notif-container">
        {/* Header */}
        <div className="notif-header">
          <div className="notif-header-left">
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount} unread</span>
            )}
          </div>
          <div className="notif-header-actions">
            {unreadCount > 0 && (
              <button className="btn-text" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="notif-tabs">
          {["all", "unread"].map((t) => (
            <button
              key={t}
              className={`notif-tab ${filter === t ? "active" : ""}`}
              onClick={() => setFilter(t)}
            >
              {t === "all"
                ? "All"
                : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="notif-list">
          {loading && page === 1 ? (
            <div className="notif-empty">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="notif-skeleton"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="notif-empty-state">
              <div className="notif-empty-icon">
                <BellRing size={28} />
              </div>
              <p className="notif-empty-title">
                {filter === "unread"
                  ? "You're all caught up"
                  : "No notifications yet"}
              </p>
              <p className="notif-empty-sub">
                {filter === "unread"
                  ? "No unread notifications right now."
                  : "We'll notify you about bookings, messages and payments here."}
              </p>
              {filter === "unread" && (
                <button
                  className="btn-outline"
                  onClick={() => setFilter("all")}
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel} className="notif-group">
                <div className="notif-date-label">{dateLabel}</div>
                {items.map((n, i) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.admin_message;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n._id}
                      className={`notif-item ${!n.read ? "unread" : ""} ${
                        deleting === n._id ? "deleting" : ""
                      }`}
                      style={{ animationDelay: `${i * 40}ms` }}
                      onClick={() => handleClick(n)}
                    >
                      <div
                        className="notif-icon-wrap"
                        style={{ "--icon-color": cfg.color }}
                      >
                        <span className="notif-icon">
                          <Icon size={18} />
                        </span>
                        {!n.read && <span className="notif-dot" />}
                      </div>
                      <div className="notif-content">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-body">{n.body}</div>
                        <div className="notif-item-meta">
                          <span
                            className="notif-type-label"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <span className="notif-time">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="notif-delete-btn"
                        onClick={(e) => handleDelete(e, n._id)}
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* Load more */}
          {!loading && page < pages && (
            <div className="notif-load-more">
              <button
                className="btn-outline"
                onClick={() => loadPage(page + 1)}
              >
                Load more
              </button>
            </div>
          )}

          {loading && page > 1 && (
            <div className="notif-loading-more">
              <span className="loading-spinner" />
              Loading...
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .notifications-page {
          min-height: 100vh;
          background: #f8f7f5;
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 80px;
        }

        .notif-container {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* Header */
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 0 20px;
          position: sticky;
          top: 0;
          background: #f8f7f5;
          z-index: 10;
          border-bottom: 1px solid #ede9e3;
          margin-bottom: 4px;
        }

        .notif-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notif-title {
          font-size: 24px;
          font-weight: 600;
          color: #1a1814;
          margin: 0;
          letter-spacing: -0.4px;
        }

        .notif-badge {
          background: #305CDE;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 20px;
          line-height: 1.6;
        }

        .btn-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #305CDE;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .btn-text:hover { opacity: 0.7; }

        /* Tabs */
        .notif-tabs {
          display: flex;
          gap: 0;
          padding: 16px 0 0;
          border-bottom: 1px solid #ede9e3;
          margin-bottom: 8px;
        }

        .notif-tab {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #9e9a93;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 8px 16px 12px 0;
          cursor: pointer;
          margin-right: 8px;
          transition: color 0.15s, border-color 0.15s;
        }
        .notif-tab:first-child { padding-left: 0; }
        .notif-tab.active {
          color: #1a1814;
          border-bottom-color: #1a1814;
        }
        .notif-tab:hover:not(.active) { color: #4a4640; }

        /* Group */
        .notif-group { margin-bottom: 8px; }

        .notif-date-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #b5b0a8;
          padding: 20px 0 8px;
        }

        /* Item */
        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 14px;
          background: #fff;
          border-radius: 12px;
          margin-bottom: 6px;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s, opacity 0.3s;
          border: 1px solid transparent;
          animation: slideIn 0.3s ease both;
          position: relative;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .notif-item:hover {
          background: #fafaf9;
          border-color: #ede9e3;
        }

        .notif-item:active { transform: scale(0.995); }

        .notif-item.unread {
          background: #fdfcff;
          border-color: #e8ecfb;
        }
        .notif-item.unread:hover { background: #f7f8fe; }

        .notif-item.deleting {
          opacity: 0;
          transform: translateX(20px);
          pointer-events: none;
        }

        /* Icon */
        .notif-icon-wrap {
          position: relative;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--icon-color) 12%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }

        .notif-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .notif-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 9px;
          height: 9px;
          background: #305CDE;
          border-radius: 50%;
          border: 2px solid #fff;
        }

        /* Content */
        .notif-content { flex: 1; min-width: 0; }

        .notif-item-title {
          font-size: 14px;
          font-weight: 500;
          color: #1a1814;
          margin-bottom: 3px;
          line-height: 1.4;
        }

        .notif-item.unread .notif-item-title {
          font-weight: 600;
        }

        .notif-item-body {
          font-size: 13px;
          color: #7a746c;
          line-height: 1.5;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notif-item-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notif-type-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .notif-time {
          font-size: 12px;
          color: #b5b0a8;
        }

        /* Delete button */
        .notif-delete-btn {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #c5c0b8;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.15s, background 0.15s, color 0.15s;
          margin-top: 2px;
        }

        .notif-item:hover .notif-delete-btn { opacity: 1; }
        .notif-delete-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        /* Empty state */
        .notif-empty-state {
          text-align: center;
          padding: 72px 24px;
        }

        .notif-empty-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          background: #fff;
          margin-bottom: 16px;
          opacity: 0.55;
          color: #8b857a;
        }

        .notif-empty-title {
          font-size: 17px;
          font-weight: 600;
          color: #1a1814;
          margin: 0 0 8px;
        }

        .notif-empty-sub {
          font-size: 14px;
          color: #9e9a93;
          max-width: 300px;
          margin: 0 auto 24px;
          line-height: 1.6;
        }

        /* Skeletons */
        .notif-empty {
          padding-top: 12px;
        }

        .notif-skeleton {
          height: 74px;
          background: linear-gradient(90deg, #f0ece6 25%, #e8e4de 50%, #f0ece6 75%);
          background-size: 200% 100%;
          border-radius: 12px;
          margin-bottom: 6px;
          animation: shimmer 1.4s ease infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Load more */
        .notif-load-more {
          text-align: center;
          padding: 24px 0 8px;
        }

        .btn-outline {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #4a4640;
          background: #fff;
          border: 1px solid #ded9d2;
          border-radius: 8px;
          padding: 9px 20px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .btn-outline:hover {
          background: #f5f2ee;
          border-color: #c8c3bb;
        }

        .notif-loading-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px;
          font-size: 13px;
          color: #9e9a93;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e8e4de;
          border-top-color: #305CDE;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .notif-container { padding: 0 12px; }
          .notif-title { font-size: 20px; }
          .notif-item { padding: 13px 12px; }
          .notif-delete-btn { opacity: 1; }
        }
      `}</style>
    </div>
    </DashboardLayout>
  );
}
