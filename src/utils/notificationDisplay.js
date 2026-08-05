import {
  CheckCheck,
  CircleSlash,
  CreditCard,
  FileText,
  MessageSquare,
  Megaphone,
  ShieldCheck,
  Star,
  Wallet,
  X,
} from "lucide-react";

export const TYPE_CONFIG = {
  booking_request: { icon: FileText, color: "#6366f1", label: "Booking request" },
  booking_confirmed: { icon: CheckCheck, color: "#10b981", label: "Booking confirmed" },
  booking_declined: { icon: X, color: "#ef4444", label: "Booking declined" },
  booking_cancelled: { icon: CircleSlash, color: "#f59e0b", label: "Booking cancelled" },
  payment_received: { icon: CreditCard, color: "#10b981", label: "Payment received" },
  new_message: { icon: MessageSquare, color: "#6366f1", label: "New message" },
  new_review: { icon: Star, color: "#f59e0b", label: "New review" },
  payout_sent: { icon: Wallet, color: "#10b981", label: "Payout sent" },
  verification_update: { icon: ShieldCheck, color: "#6366f1", label: "Verification update" },
  admin_message: { icon: Megaphone, color: "#64748b", label: "From Vencome" },
};

export function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
