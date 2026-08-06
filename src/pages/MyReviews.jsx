import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { apiFetch } from "../utils/api";

const ReviewRow = ({ review, subtitle }) => (
  <div style={{
    background: "#fff", borderRadius: "16px",
    border: "1px solid #E5E7EB", padding: "20px",
  }}>
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
      {review.property?.coverImage && (
        <img
          src={review.property.coverImage}
          alt={review.property.title}
          style={{
            width: "80px", height: "60px", objectFit: "cover",
            borderRadius: "10px", flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "0 0 4px" }}>
          {subtitle}
        </p>
        <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              fill={star <= review.rating ? "#F59E0B" : "none"}
              color={star <= review.rating ? "#F59E0B" : "#D1D5DB"}
            />
          ))}
          <span style={{ fontSize: "13px", color: "#6B7280", marginLeft: "4px" }}>
            {new Date(review.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
        {review.comment && (
          <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6", margin: 0 }}>
            {review.comment}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default function MyReviews() {
  const [myReviews, setMyReviews] = useState([]);
  const [aboutMeReviews, setAboutMeReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("given");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [given, aboutMe] = await Promise.all([
          apiFetch({ endpoint: "/reviews/my-reviews", method: "GET" }),
          apiFetch({ endpoint: "/reviews/about-me", method: "GET" }),
        ]);
        setMyReviews(Array.isArray(given) ? given : given.reviews || []);
        setAboutMeReviews(Array.isArray(aboutMe) ? aboutMe : aboutMe.reviews || []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return (
    <DashboardLayout title="My Reviews">
      <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
        Loading reviews...
      </div>
    </DashboardLayout>
  );

  const reviews = activeTab === "given" ? myReviews : aboutMeReviews;

  return (
    <DashboardLayout title="My Reviews">
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[
          { key: "given", label: `Reviews You Left (${myReviews.length})` },
          { key: "received", label: `Reviews About You (${aboutMeReviews.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "9999px",
              border: activeTab === tab.key ? "none" : "1px solid #E5E7EB",
              background: activeTab === tab.key ? "#0A1628" : "#fff",
              color: activeTab === tab.key ? "#fff" : "#0A1628",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 0",
          background: "#fff", borderRadius: "16px",
          border: "1px solid #E5E7EB",
        }}>
          <Star size={48} color="#D1D5DB" style={{ marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>
            No reviews yet
          </p>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            {activeTab === "given"
              ? "Reviews you leave for spaces will appear here."
              : "Reviews hosts leave about you will appear here once revealed."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((review) => (
            <ReviewRow
              key={review._id}
              review={review}
              subtitle={
                activeTab === "given"
                  ? review.property?.title || "Property"
                  : `From ${review.host?.displayName || review.host?.firstName || "Host"} — ${review.property?.title || "Property"}`
              }
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
