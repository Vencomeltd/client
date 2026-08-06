import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function PlatformReviewsSection() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    apiFetch({ endpoint: "/platform-reviews", method: "GET", showErrorToast: false })
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section style={{ background: "#F8F6F0", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0A1628", marginBottom: 8 }}>
            What Our Members Say
          </h2>
          <p style={{ fontSize: 16, color: "#6B7280" }}>
            Real feedback from businesses using VenCome.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {reviews.slice(0, 6).map((review) => (
            <div
              key={review._id}
              style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E5E7EB", padding: 24 }}
            >
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= review.rating ? "#F59E0B" : "none"}
                    color={star <= review.rating ? "#F59E0B" : "#D1D5DB"}
                  />
                ))}
              </div>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>
                "{review.comment}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={review.user?.profileImage || "/avatar-placeholder.png"}
                  alt={review.user?.displayName || "VenCome member"}
                  style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0A1628" }}>
                  {review.user?.displayName || review.user?.firstName || "VenCome Member"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
