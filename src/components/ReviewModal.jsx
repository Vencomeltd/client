import { useState } from "react";
import { Star, X } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiFetch({
        endpoint: "/reviews",
        method: "POST",
        body: { bookingId: booking._id, rating, comment },
      });
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: "20px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "32px",
        maxWidth: "480px", width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0A1628", margin: 0 }}>
            Leave a Review
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
            <X size={20} />
          </button>
        </div>

        {booking?.property?.title && (
          <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>
            Reviewing: <strong style={{ color: "#0A1628" }}>{booking.property.title}</strong>
          </p>
        )}

        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628", marginBottom: "12px" }}>
            Your rating
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <Star
                  size={32}
                  fill={(hovered || rating) >= star ? "#F59E0B" : "none"}
                  color={(hovered || rating) >= star ? "#F59E0B" : "#D1D5DB"}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "8px" }}>
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628", display: "block", marginBottom: "8px" }}>
            Your review (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this space..."
            rows={4}
            style={{
              width: "100%", padding: "12px", borderRadius: "10px",
              border: "1.5px solid #E5E7EB", fontSize: "14px",
              fontFamily: "inherit", resize: "none", outline: "none",
              boxSizing: "border-box", lineHeight: "1.6",
            }}
          />
        </div>

        {error && (
          <p style={{ color: "#EF4444", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "14px", borderRadius: "10px",
              border: "1.5px solid #E5E7EB", background: "#fff",
              color: "#0A1628", fontSize: "15px", fontWeight: "600", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            style={{
              flex: 1, padding: "14px", borderRadius: "10px", border: "none",
              background: loading || !rating ? "#9CA3AF" : "#2E58EC",
              color: "#fff", fontSize: "15px", fontWeight: "600",
              cursor: loading || !rating ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
