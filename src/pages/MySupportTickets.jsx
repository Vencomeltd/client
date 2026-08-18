import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LifeBuoy, MessageCircle } from "lucide-react";
import apiFetch from "../utils/apiClient";
import DashboardLayout from "../layouts/DashboardLayout";
import { timeAgo } from "../utils/notificationDisplay";

const CATEGORY_OPTIONS = [
  { value: "booking_payments", label: "Booking & Payments" },
  { value: "hosting_listings", label: "Hosting & Listings" },
  { value: "account_security", label: "Account & Security" },
  { value: "trust_safety", label: "Trust & Safety" },
  { value: "technical", label: "Technical Issue" },
  { value: "other", label: "Other" },
];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((option) => [option.value, option.label])
);

const STATUS_CONFIG = {
  open: { label: "Open", classes: "border-[rgba(48,92,222,0.2)] bg-[rgba(48,92,222,0.1)] text-[#305CDE]" },
  in_progress: { label: "In Progress", classes: "border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] text-[#D97706]" },
  waiting_on_user: { label: "Waiting on You", classes: "border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.1)] text-[#7C3AED]" },
  resolved: { label: "Resolved", classes: "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]" },
  closed: { label: "Closed", classes: "border-[rgba(107,114,128,0.2)] bg-[rgba(107,114,128,0.1)] text-[#6B7280]" },
};

function StatusPill({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${config.classes}`}>
      {config.label}
    </span>
  );
}

export default function MySupportTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await apiFetch("/support/tickets");
        const data = await res.json();
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      } catch (err) {
        console.error("Failed to load support tickets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleStartConversation = async (event) => {
    event.preventDefault();
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const trimmed = message.trim();
      const subject = trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
      const res = await apiFetch("/support/tickets", {
        method: "POST",
        body: JSON.stringify({ category, subject, message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start conversation");
      navigate(`/support/tickets/${data._id}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError("Couldn't start the conversation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout title="Support">
        <div className="py-16 text-center text-[14px] text-[#6B7280]">
          Loading your support tickets...
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout title="Support">
      <div className="mx-auto max-w-[720px]">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(48,92,222,0.1)] text-[#305CDE]">
              <MessageCircle size={20} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-[#0A1628]">Start a conversation</h1>
              <p className="text-[13px] text-[#6B7280]">
                Tell us what's going on — our team will reply here.
              </p>
            </div>
          </div>

          <form onSubmit={handleStartConversation} className="mt-5 flex flex-col gap-3">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#0A1628]"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="How can we help?"
              rows={4}
              className="resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-[14px] text-[#111827] outline-none focus:border-[#0A1628]"
            />

            {error ? <p className="text-[13px] text-[#DC2626]">{error}</p> : null}

            <button
              type="submit"
              disabled={!message.trim() || submitting}
              className="self-end rounded-lg bg-[#305CDE] px-6 py-2.5 text-[14px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send"}
            </button>
          </form>
        </div>

        <h2 className="mt-8 mb-4 text-[16px] font-bold text-[#0A1628]">Your tickets</h2>

        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F6F0] text-[#6B7280]">
              <LifeBuoy size={32} />
            </div>
            <h3 className="mt-5 text-[16px] font-bold text-[#0A1628]">No tickets yet</h3>
            <p className="mt-2 text-[14px] text-[#6B7280]">
              Start a conversation above and our team will get back to you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => navigate(`/support/tickets/${ticket._id}`)}
                className="cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white p-5 transition hover:border-[#0A1628]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#6B7280]">{ticket.ticketNumber}</p>
                    <h3 className="mt-1 truncate text-[15px] font-bold text-[#0A1628]">
                      {ticket.subject}
                    </h3>
                  </div>
                  <StatusPill status={ticket.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
                  <span className="rounded-md bg-[rgba(10,22,40,0.06)] px-2.5 py-1 font-semibold text-[#0A1628]">
                    {CATEGORY_LABELS[ticket.category] || ticket.category}
                  </span>
                  <span>Updated {timeAgo(ticket.lastMessageAt || ticket.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
