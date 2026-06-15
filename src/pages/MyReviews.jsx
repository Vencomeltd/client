import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { apiFetch } from "../utils/api";

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiFetch({
          endpoint: "/reviews/my-reviews",
          method: "GET",
        });
        setReviews(Array.isArray(data) ? data : data.reviews || []);
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

  return (
    <DashboardLayout title="My Reviews">
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
            Reviews you leave for spaces will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((review) => (
            <div key={review._id} style={{
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
                    {review.property?.title || "Property"}
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
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
