import React, { useState } from "react";
import { Star } from "lucide-react";
import Button from "./Button";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/api";
import Modal from "./Modal";
import { toast } from "react-toastify";

const TripCard = ({ trip, onBookAgain }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [rating, setRating] = useState(0); // star rating state
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  // Open modal
  const openReviewModal = (tripId) => {
    setCurrentTripId(tripId);
    setIsModalOpen(true);
  };

  // Close modal
  const closeReviewModal = () => {
    setIsModalOpen(false);
    setCurrentTripId(null);
    setRating(0); // reset rating
  };

  const submitReviewMutation = useMutation({
    mutationFn: async ({ bookingId, rating, comment }) => {
      return apiFetch({
        endpoint: "/reviews",
        method: "POST",
        body: { bookingId, rating, comment },
      });
    },
    onSuccess: () => {
      // Optionally invalidate queries so UI updates
      queryClient.invalidateQueries({
        queryKey: ["canReview", currentTripId],
      });
      closeReviewModal();
      toast.success("Review submitted successfully!");
    },
    onError: (err) => {
      console.error(err);
      alert(err?.message || "Failed to submit review");
    },
  });

  // Handle form submit
  const handleSubmitReview = (e) => {
    e.preventDefault();

    if (!rating) {
      alert("Please select a rating before submitting");
      return;
    }

    submitReviewMutation.mutate({
      bookingId: currentTripId,
      rating,
      comment,
    });
  };

  const isHourly = trip.pricingType === "hourly";

  const unitLabel = isHourly ? "hourly" : "nightly";
  const unitPrice = isHourly ? trip.hourlyPrice : trip.weekdayPrice;
  const unitCount = isHourly ? trip.hours : trip.nights;
  const unitText = isHourly ? "hours" : "nights";

  const { data: canReviewData, isLoading } = useQuery({
    queryKey: ["canReview", trip._id],
    queryFn: () =>
      apiFetch({
        endpoint: `/reviews/${trip._id}/can-review`,
        method: "GET",
        credentials: "include",
      }),
    enabled: !!trip._id,
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <img
        src={trip.property.coverImage}
        alt={trip.title}
        className="w-full h-40 object-cover rounded-lg mb-2"
      />

      <h3 className="text-lg font-semibold">{trip.title}</h3>
      <p className="text-gray-600">{trip.location}</p>

      <p className="text-gray-600">
        Price: ${trip.totalPrice} (${unitPrice}/{unitLabel}, {unitCount}{" "}
        {unitText})
      </p>

      <p className="text-gray-600">
        Dates: {new Date(trip.checkIn).toLocaleDateString()} –{" "}
        {new Date(trip.checkOut).toLocaleDateString()}
      </p>
      <div className="flex gap-2">
        {!isLoading && canReviewData?.canReview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openReviewModal(trip._id)}
          >
            Write Review
          </Button>
        )}

        {trip.reviewed && (
          <div className="flex items-center text-sm text-green-600 mt-1">
            Reviewed
          </div>
        )}

        <Button onClick={onBookAgain}>Book Again</Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeReviewModal}>
        <h2 className="text-2xl font-bold mb-2">Write a Review</h2>
        <p>Guide more people on how your experience about this booking was</p>
        {/* Star Rating */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`cursor-pointer ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              <Star
                size={24}
                className={star <= rating ? "fill-current" : ""}
              />
            </button>
          ))}
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmitReview}>
          <textarea
            placeholder="Write your review..."
            rows={5}
            className="border border-gray-300 rounded-lg p-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeReviewModal}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TripCard;
