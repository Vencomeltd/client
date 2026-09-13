import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Wallet as WalletIcon } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import apiFetch from "../utils/apiClient";

const formatCurrency = (value) => `£${new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)}`;

const TYPE_LABEL = {
  deposit_credit: "Deposit held",
  deposit_refund: "Deposit refunded to guest",
  claim_settled: "Damage claim settled",
  transferred_to_host: "Transferred to your payout account",
};

function BalanceCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", padding: "20px" }}>
      <p style={{ fontSize: "12px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: "30px", fontWeight: "800", color: accent || "#0A1628", margin: "6px 0 4px" }}>
        {value}
      </p>
      {sub ? <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{sub}</p> : null}
    </div>
  );
}

export default function Wallet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await apiFetch("/wallet");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Request failed");
        setData(json);
      } catch (err) {
        setError(err.message || "Failed to load wallet");
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Wallet">
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 size={32} className="animate-spin" color="#2E58EC" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout title="Wallet">
        <p style={{ textAlign: "center", color: "#6B7280", padding: "60px 0" }}>
          {error || "Failed to load wallet."}
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Wallet">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <BalanceCard
            label="Reserved Balance"
            value={formatCurrency(data.reservedBalance)}
            sub="Security deposits held for active bookings"
          />
          <BalanceCard
            label="Available Balance"
            value={formatCurrency(data.availableBalance)}
            sub="Released deposits, sent to your payout account automatically"
            accent="#16A34A"
          />
        </div>

        <div style={{ background: "#F5F7FF", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <ShieldCheck size={18} color="#305CDE" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: 1.5 }}>
            Security deposits are held here separately from your rental income. Once a booking's dispute window
            closes with no claim, the deposit moves to your available balance and is transferred to your payout
            account automatically.
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px" }}>
          <p style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginBottom: "20px" }}>
            Deposit Activity
          </p>
          {!data.transactions || data.transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <WalletIcon size={32} color="#D1D5DB" style={{ marginBottom: "12px" }} />
              <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0 }}>No deposit activity yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data.transactions.map((tx, index) => (
                <div
                  key={tx._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    padding: "14px 0",
                    borderBottom: index < data.transactions.length - 1 ? "1px solid #F3F4F6" : "none",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628", margin: "0 0 2px" }}>
                      {TYPE_LABEL[tx.type] || tx.type}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      {tx.booking?.checkIn ? new Date(tx.booking.checkIn).toLocaleDateString() : new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      flexShrink: 0,
                      color: tx.type === "deposit_refund" || tx.type === "transferred_to_host" ? "#DC2626" : "#16A34A",
                    }}
                  >
                    {tx.type === "deposit_refund" || tx.type === "transferred_to_host" ? "-" : "+"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
