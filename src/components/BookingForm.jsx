import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { addDays, differenceInDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Button from "./Button";
import { apiFetch } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { toast } from "react-toastify";

export default function BookingForm({ property }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [licensePdf, setLicensePdf] = useState(null);
  const [licensePdfError, setLicensePdfError] = useState(null);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  const [checkInTime, setCheckInTime] = useState("09:00"); // default
  const [checkOutTime, setCheckOutTime] = useState("18:00"); // default

  // Generate time options every 30 mins
  const generateAllowedTimes = (openTime = "00:00", closeTime = "23:30") => {
    const times = [];
    const [openH, openM] = openTime.split(":").map(Number);
    const [closeH, closeM] = closeTime.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    for (let total = openMinutes; total <= closeMinutes; total += 30) {
      const h = Math.floor(total / 60)
        .toString()
        .padStart(2, "0");
      const m = (total % 60).toString().padStart(2, "0");
      times.push(`${h}:${m}`);
    }
    return times;
  };

  const openTime = property.customAvailability?.openTime || "09:00";
  const closeTime = property.customAvailability?.closeTime || "18:00";
  const minBookingHours = property.customAvailability?.minBookingHours || 1;
  const allowedDays = property.customAvailability?.days; // e.g. [1,2,3,4,5]

  // Allowed time slots for this property
  const timeOptions = generateAllowedTimes(openTime, closeTime);

  const isDayDisabled = (date) => {
    // If host defined specific days, block everything else
    if (allowedDays && allowedDays.length > 0) {
      return !allowedDays.includes(date.getDay()); // getDay(): 0=Sun … 6=Sat
    }
    // Fallback to the string-based availability field
    const dow = date.getDay();
    if (property.availability === "weekdays") return dow === 0 || dow === 6;
    if (property.availability === "weekends") return dow >= 1 && dow <= 5;
    return false;
  };

  const checkOutOptions = timeOptions.filter((t) => {
    const [inH, inM] = checkInTime.split(":").map(Number);
    const [outH, outM] = t.split(":").map(Number);
    const diffHours = (outH * 60 + outM - (inH * 60 + inM)) / 60;
    return diffHours >= minBookingHours;
  });

  // Calculate hours per day based on times only (ignore dates)
  const getHoursPerDay = () => {
    const tempStart = new Date(2025, 0, 1); // arbitrary same day
    const [startH, startM] = checkInTime.split(":").map(Number);
    tempStart.setHours(startH, startM, 0, 0);

    const tempEnd = new Date(2025, 0, 1);
    const [endH, endM] = checkOutTime.split(":").map(Number);
    tempEnd.setHours(endH, endM, 0, 0);

    if (tempEnd <= tempStart) {
      return 0; // invalid
    }

    return (tempEnd - tempStart) / (1000 * 60 * 60);
  };

  // Actual check-in/out for submit (startDate + inTime, endDate + outTime)
  const getFullCheckIn = () => {
    const date = new Date(range[0].startDate);
    const [hours, minutes] = checkInTime.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const getFullCheckOut = () => {
    const date = new Date(range[0].endDate);
    const [hours, minutes] = checkOutTime.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Recalculate whenever dates or times change
  const hoursPerDay = getHoursPerDay();
  const checkInFull = getFullCheckIn();
  const checkOutFull = getFullCheckOut();

  // Correct nights calculation
  const startDayOnly = new Date(range[0].startDate);
  startDayOnly.setHours(0, 0, 0, 0);
  const endDayOnly = new Date(range[0].endDate);
  endDayOnly.setHours(0, 0, 0, 0);

  const nights = differenceInDays(endDayOnly, startDayOnly);
  const nightRate = Number(property.pricing?.weekdayPrice) || 0;

  // Same-day booking = 0 nights → treat as 1 night (most booking apps do this)
  const displayNights = nights === 0 ? 1 : nights;
  const totalPriceNightly = displayNights * nightRate;

  // const nights = differenceInDays(range[0].endDate, range[0].startDate) || 1;
  const days = differenceInDays(range[0].endDate, range[0].startDate) + 1 || 1;
  const totalHours = days * hoursPerDay;

  // Pricing calculations (exactly matches updated backend logic)
  const isHourly = property.pricing?.pricingType === "HOURLY";
  const hourlyRate = Number(property.pricing?.hourlyPrice) || 0;

  const subtotal = isHourly ? totalHours * hourlyRate : nights * nightRate;

  // Optional: add extras/discounts here if needed
  const totalPrice = Number(subtotal.toFixed(2));

  useEffect(() => {
    const search = window.location.search;

    if (search.includes("success=true")) {
      setCountdown(3);
      setShowModal(true);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowModal(false);
            navigate("/my-bookings", { replace: true });
            window.location.reload();
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }

    if (search.includes("cancel=true")) {
      toast.error("Payment cancelled. Your booking was not confirmed.");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hoursPerDay <= 0) {
      toast.warn("Check-out time must be after check-in time");
      return;
    }

    if (checkOutFull < checkInFull) {
      toast.warn("Overall check-out must be after check-in");
      return;
    }
    if (property.category.name === "Medical Rooms") {
      if (licensePdf === null) {
        toast.warn("Please upload your license");
        return;
      }
    }

    setLoading(true);

    let redirectingToStripe = false;

    try {
      const formData = new FormData();
      formData.append("propertyId", property._id);
      formData.append("checkIn", checkInFull.toISOString());
      formData.append("checkOut", checkOutFull.toISOString());
      formData.append("guests", guests);
      formData.append("extras", JSON.stringify([])); // add selected extras here

      if (licensePdf) {
        formData.append("licensePdf", licensePdf); // must be a File object
      }

      const token = localStorage.getItem("vencome_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        console.log(err);
        throw new Error(err.error || "Booking failed");
      }

      const booking = await response.json();
      const { url } = await apiFetch({
        endpoint: "/payments/create-checkout-session",
        method: "POST",
        body: { bookingId: booking._id },
      });

      redirectingToStripe = true;
      window.location.href = url;
    } catch (err) {
      toast.error("Booking failed: " + (err.message || "Please try again"));
    } finally {
      if (!redirectingToStripe) {
        setLoading(false);
      }
    }
  };
  return (
    <div>
      <div className="flex border rounded-2xl w-full mb-4 text-sm">
        <div className="flex-1 border-r px-4 py-3">
          <p className="text-gray-600">Check-in</p>
          <p className="font-semibold">
            {range[0].startDate.toLocaleDateString()}
          </p>
        </div>
        <div className="flex-1 px-4 py-3">
          <p className="text-gray-600">Check-out</p>
          <p className="font-semibold">
            {range[0].endDate.toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Check-in Time
          </label>
          <select
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Check-out Time
          </label>
          <select
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="my-4">
        <label className="block text-sm font-medium mb-1">Guests</label>
        <input
          type="number"
          min="1"
          max={property.maxGuests || 10}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <DateRange
        ranges={range}
        onChange={(item) => setRange([item.selection])}
        moveRangeOnFirstSelection={false}
        rangeColors={["#305CDE"]}
        minDate={new Date()}
        showDateDisplay={false}
        disabledDay={isDayDisabled} // ← NEW
        className="mx-auto"
      />

      {/* Price Display - Now Correct for Multi-Day Slots */}
      <div className="mt-6 pt-4 border-t">
        {isHourly ? (
          <div className="space-y-1 text-right">
            <p className="text-gray-600">
              {days} day{days > 1 ? "s" : ""} × {hoursPerDay.toFixed(1)} hrs/day
              × ${hourlyRate}/hr
            </p>
            <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
          </div>
        ) : (
          <div className="space-y-1 text-right">
            {nights === 0 ? (
              <p className="text-orange-600 text-sm">
                Same-day booking = 1 day
              </p>
            ) : null}
            <p className="text-gray-600">
              {displayNights} day{displayNights > 1 ? "s" : ""} × ${nightRate}
              /day
            </p>
            <p className="text-2xl font-bold">
              ${totalPriceNightly.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {property.category.name === "Medical Rooms" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              License PDF
            </label>

            {!licensePdf ? (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-colors duration-200">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        setLicensePdfError("File must be under 10MB");
                        return;
                      }
                      setLicensePdfError(null);
                      setLicensePdf(file);
                    }
                  }}
                />
                <svg
                  className="w-7 h-7 text-gray-400 mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                  />
                </svg>
                <span className="text-sm text-gray-500">
                  Click to upload PDF
                </span>
                <span className="text-xs text-gray-400 mt-0.5">
                  PDF only · Max 10MB
                </span>
              </label>
            ) : (
              <div className="flex items-center justify-between w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 4h5v5a1 1 0 001 1h5v10H6V4z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {licensePdf.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(licensePdf.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove uploaded file"
                  onClick={() => {
                    setLicensePdf(null);
                    setLicensePdfError(null);
                  }}
                  className="flex-shrink-0 ml-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {licensePdfError && (
              <p className="text-xs text-red-500">{licensePdfError}</p>
            )}
          </div>
        </div>
      )}
      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={loading || totalPrice === 0 || hoursPerDay <= 0}
        className="w-full mt-6"
      >
        {loading ? "Booking..." : `Book Now – $${totalPrice.toFixed(2)}`}
      </Button>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center flex flex-col items-center">
            <IoIosCheckmarkCircleOutline size={100} color="green" />
            <h2 className="text-2xl font-bold mt-4 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600">
              Redirecting in {countdown} second{countdown > 1 ? "s" : ""}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
