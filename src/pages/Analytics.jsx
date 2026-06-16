import { useEffect, useState } from "react";
import { TrendingUp, Calendar, PoundSterling, Building2, Loader2 } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import apiFetch from "../utils/apiClient";

const formatCurrency = (value) => `£${new Intl.NumberFormat("en-GB").format(Math.round(value || 0))}`;

function MetricCard({ icon: Icon, label, value, iconBg, iconColor }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "14px",
      border: "1px solid #E5E7EB", padding: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: iconBg, display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0,
        }}>
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

function BarChart({ data }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxBookings = Math.max(...data.map((d) => d.bookings), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "180px", padding: "0 8px" }}>
      {data.map((item) => (
        <div key={item.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", width: "100%", height: "150px" }}>
            <div style={{
              flex: 1, borderRadius: "4px 4px 0 0", background: "#0A1628",
              height: `${(item.revenue / maxRevenue) * 100}%`,
              minHeight: item.revenue > 0 ? "4px" : "0",
            }} />
            <div style={{
              flex: 1, borderRadius: "4px 4px 0 0", background: "#2E58EC",
              height: `${(item.bookings / maxBookings) * 100}%`,
              minHeight: item.bookings > 0 ? "4px" : "0",
            }} />
          </div>
          <span style={{ fontSize: "11px", color: "#6B7280" }}>{item.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiFetch("/properties/analytics/me");
        console.log("Analytics response status:", res.status);
        const json = await res.json();
        console.log("Analytics response body:", json);
        if (!res.ok) {
          throw new Error(json.error || json.message || "Request failed");
        }
        setData(json);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <DashboardLayout title="Analytics">
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader2 size={32} className="animate-spin" color="#2E58EC" />
      </div>
    </DashboardLayout>
  );

  if (!data) return (
    <DashboardLayout title="Analytics">
      <p style={{ textAlign: "center", color: "#6B7280", padding: "60px 0" }}>
        Failed to load analytics.
      </p>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Analytics">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Metrics */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}>
          <MetricCard
            icon={PoundSterling}
            label="Total Revenue"
            value={formatCurrency(data.totalRevenue)}
            iconBg="rgba(46,88,236,0.1)"
            iconColor="#2E58EC"
          />
          <MetricCard
            icon={Calendar}
            label="Total Bookings"
            value={data.totalBookings}
            iconBg="rgba(10,22,40,0.06)"
            iconColor="#0A1628"
          />
          <MetricCard
            icon={TrendingUp}
            label="Avg Booking Value"
            value={formatCurrency(data.avgBookingValue)}
            iconBg="rgba(22,163,74,0.1)"
            iconColor="#16A34A"
          />
          <MetricCard
            icon={Building2}
            label="Active Listings"
            value={data.totalListings}
            iconBg="rgba(217,119,6,0.1)"
            iconColor="#D97706"
          />
        </div>

        {/* Chart */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px" }}>
          <p style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginBottom: "20px" }}>
            Revenue & Bookings — Last 6 Months
          </p>
          {data.monthlyData?.length > 0 ? (
            <>
              <BarChart data={data.monthlyData} />
              <div style={{ display: "flex", gap: "20px", marginTop: "16px", fontSize: "12px", color: "#6B7280" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#0A1628", display: "inline-block" }} />
                  Revenue
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#2E58EC", display: "inline-block" }} />
                  Bookings
                </span>
              </div>
            </>
          ) : (
            <p style={{ color: "#9CA3AF", fontSize: "14px", textAlign: "center", padding: "40px 0" }}>
              No booking data yet
            </p>
          )}
        </div>

        {/* Top listings */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px" }}>
          <p style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginBottom: "20px" }}>
            Performance by Listing
          </p>
          {data.listingStats?.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>
              You haven't listed any spaces yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {data.listingStats?.map((listing, index) => (
                <div key={listing.propertyId} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 0",
                  borderBottom: index < data.listingStats.length - 1 ? "1px solid #F3F4F6" : "none",
                }}>
                  {listing.coverImage && (
                    <img
                      src={listing.coverImage}
                      alt={listing.title}
                      style={{ width: "56px", height: "44px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#0A1628", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {listing.title}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                      {listing.bookings} booking{listing.bookings !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", flexShrink: 0 }}>
                    {formatCurrency(listing.revenue)}
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
