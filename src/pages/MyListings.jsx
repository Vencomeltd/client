import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Edit2, Eye, MapPin, Plus } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const token = localStorage.getItem("vencome_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch listings");

        const data = await response.json();
        setListings(data.properties || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  return (
    <DashboardLayout title="My Listings">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[24px] font-extrabold text-[#0A1628]">My Listings</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            {listings.length} space{listings.length === 1 ? "" : "s"} in your portfolio
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/create-space")}
          className="inline-flex items-center gap-2 rounded-[10px] bg-[#305CDE] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#254FC7]"
        >
          <Plus size={16} />
          <span>Add New Space</span>
        </button>
      </div>

      <div className="rounded-[20px] border border-[#E5E7EB] bg-white px-6 py-6">
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
            Loading your listings...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#EF4444" }}>
            {error}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#6B7280", marginBottom: "16px" }}>
              You haven&apos;t listed any spaces yet.
            </p>
            <a
              href="/create-space"
              style={{
                background: "#0A1628",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Add Your First Space
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="group overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)]"
              >
                <div className="relative h-[180px] overflow-hidden md:h-[200px]">
                  {listing.coverImage ? (
                    <img
                      src={listing.coverImage}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#F8F6F0] text-[#6B7280]">
                      <Building2 size={40} />
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ${
                      listing.isActive ? "bg-[#16A34A] text-white" : "bg-[#9CA3AF] text-white"
                    }`}
                  >
                    {listing.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="px-5 py-[18px]">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[16px] font-bold text-[#0A1628]">{listing.title}</h3>
                    <p className="text-right text-[14px] font-semibold text-[#305CDE]">
                      {listing.pricing?.hourly
                        ? `\u00A3${listing.pricing.hourly}/hr`
                        : ""}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                    <MapPin size={12} />
                    <span>{`${listing.location?.city || ""}, ${listing.location?.country || ""}`}</span>
                  </div>

                  <div className="mt-4 border-t border-[#F3F4F6] pt-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={`/edit-space/${listing._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#111827] transition hover:border-[#0A1628]"
                      >
                        <Edit2 size={14} />
                        Edit
                      </a>
                      <a
                        href={`/property/${listing._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A1628] px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#13243f]"
                      >
                        <Eye size={14} />
                        View
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
