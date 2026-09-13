import { useEffect, useState } from "react";
import { Loader2, Receipt, TrendingUp, Clock } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import apiFetch from "../utils/apiClient";

const formatCurrency = (value) => `£${new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)}`;

const STATUS_STYLE = {
  paid: { bg: "rgba(22,163,74,0.1)", color: "#16A34A", label: "Paid" },
  in_transit: { bg: "rgba(217,119,6,0.1)", color: "#D97706", label: "In Transit" },
  pending: { bg: "rgba(107,114,128,0.1)", color: "#6B7280", label: "Pending" },
  failed: { bg: "rgba(220,38,38,0.1)", color: "#DC2626", label: "Failed" },
  canceled: { bg: "rgba(220,38,38,0.1)", color: "#DC2626", label: "Canceled" },
};

function MetricCard({ icon: Icon, label, value, iconBg, iconColor }) {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color={iconColor} />
        </div>
        <div>
          <p style={{ fontSize: "12px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
            {label}
          </p>
          <p style={{ fontSize: "26px", fontWeight: "800", color: "#0A1628", margin: "4px 0 0" }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [payouts, setPayouts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await apiFetch("/payouts/payout-history");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Request failed");
        setPayouts(json.payouts || []);
      } catch (err) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Transactions">
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 size={32} className="animate-spin" color="#2E58EC" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !payouts) {
    return (
      <DashboardLayout title="Transactions">
        <p style={{ textAlign: "center", color: "#6B7280", padding: "60px 0" }}>
          {error || "Failed to load transactions."}
        </p>
      </DashboardLayout>
    );
  }

  const totalPaidOut = payouts.filter((p) => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingTotal = payouts.filter((p) => p.status === "pending" || p.status === "in_transit").reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <DashboardLayout title="Transactions">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <MetricCard
            icon={TrendingUp}
            label="Total Paid Out"
            value={formatCurrency(totalPaidOut)}
            iconBg="rgba(22,163,74,0.1)"
            iconColor="#16A34A"
          />
          <MetricCard
            icon={Clock}
            label="Pending / In Transit"
            value={formatCurrency(pendingTotal)}
            iconBg="rgba(217,119,6,0.1)"
            iconColor="#D97706"
          />
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px" }}>
          <p style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginBottom: "20px" }}>
            Payout History
          </p>
          {payouts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Receipt size={32} color="#D1D5DB" style={{ marginBottom: "12px" }} />
              <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0 }}>
                No payouts yet. Payouts appear here 24 hours after each booking completes.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {payouts.map((payout, index) => {
                const status = STATUS_STYLE[payout.status] || STATUS_STYLE.pending;
                const propertyTitle = payout.booking?.property?.title || "Booking";
                return (
                  <div
                    key={payout._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "14px",
                      padding: "14px 0",
                      borderBottom: index < payouts.length - 1 ? "1px solid #F3F4F6" : "none",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#0A1628", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {propertyTitle}
                      </p>
                      <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                        {payout.releasedAt ? new Date(payout.releasedAt).toLocaleDateString() : new Date(payout.createdAt).toLocaleDateString()}
                        {" · "}Guest paid {formatCurrency(payout.totalReceived)}, platform fee {formatCurrency(payout.platformFee)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: status.bg,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: 0, minWidth: "70px", textAlign: "right" }}>
                        {formatCurrency(payout.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
