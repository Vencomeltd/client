import { useEffect, useState } from "react";
import { Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import apiFetch from "../utils/apiClient";

export default function SavedSpaces() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await apiFetch("/properties/saved/me");
        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        console.error("Failed to fetch saved spaces:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleUnsave = async (propertyId) => {
    try {
      await apiFetch(`/properties/${propertyId}/save`, { method: "POST" });
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      console.error("Failed to unsave:", err);
    }
  };

  const getPrice = (pricing) => {
    if (!pricing) return null;
    if (pricing.hourly) return `£${pricing.hourly}/hr`;
    if (pricing.daily) return `£${pricing.daily}/day`;
    if (pricing.weekly) return `£${pricing.weekly}/wk`;
    if (pricing.monthly) return `£${pricing.monthly}/mo`;
    return null;
  };

  if (loading)
    return (
      <DashboardLayout title="Saved Spaces">
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#6B7280",
          }}
        >
          Loading saved spaces...
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout title="Saved Spaces">
      {properties.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
          }}
        >
          <Heart size={48} color="#D1D5DB" style={{ marginBottom: "16px" }} />
          <p
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            No saved spaces yet
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "#6B7280",
              marginBottom: "20px",
            }}
          >
            Tap the heart icon on any listing to save it here.
          </p>
          <Link
            to="/search"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              borderRadius: "10px",
              background: "#2E58EC",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Browse Spaces
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {properties.map((property) => (
            <div
              key={property._id}
              style={{
                background: "#fff",
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "relative" }}>
                <Link to={`/property/${property._id}`}>
                  <img
                    src={
                      property.coverImage ||
                      property.images?.[0] ||
                      "/placeholder.jpg"
                    }
                    alt={property.title}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => handleUnsave(property._id)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.5)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Heart size={16} fill="#fff" color="#fff" />
                </button>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <Link
                  to={`/property/${property._id}`}
                  style={{ textDecoration: "none" }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0A1628",
                      margin: "0 0 4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {property.title}
                  </p>
                </Link>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    margin: "0 0 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <MapPin size={12} />
                  {property.location?.city}
                  {property.location?.country
                    ? `, ${property.location.country}`
                    : ""}
                </p>
                {getPrice(property.pricing) && (
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0A1628",
                      margin: 0,
                    }}
                  >
                    {getPrice(property.pricing)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
