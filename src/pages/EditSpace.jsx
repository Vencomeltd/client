import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import DayOfWeekPricing from "../components/DayOfWeekPricing";
import BlockDatesEditor from "../components/BlockDatesEditor";

export default function EditSpace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingPhotoUrl, setDeletingPhotoUrl] = useState(null);
  const [photoError, setPhotoError] = useState("");

  const [calendarUrl, setCalendarUrl] = useState("");
  const [calendarSavedUrl, setCalendarSavedUrl] = useState("");
  const [calendarLastSynced, setCalendarLastSynced] = useState(null);
  const [calendarSyncError, setCalendarSyncError] = useState(null);
  const [savingCalendar, setSavingCalendar] = useState(false);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [calendarMessage, setCalendarMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    whatsIncluded: "",
    category: "",
    address: "",
    city: "",
    country: "",
    postcode: "",
    lat: null,
    lng: null,
    photos: [],
    photoUrls: [],
    extras: [],
    pricing: {
      hourly: { enabled: false, price: "" },
      daily: { enabled: false, price: "" },
      weekly: { enabled: false, price: "" },
      monthly: { enabled: false, price: "" },
      annual: { enabled: false, price: "" },
    },
    customDayPricingEnabled: false,
    customDayPricing: [],
    singleDayOnly: false,
    discounts: { newListing: false, lastMinute: false, weekly: false, monthly: false, extendedHours: 0 },
    blockedDates: [],
    leaseAgreement: null,
    availability: {
      openDays: [],
      openTime: "",
      closeTime: "",
      minNotice: "",
      instantBook: false,
    },
    bufferTime: { before: "", after: "" },
    capacity: "",
    unitsCount: "1",
    amenities: [],
    rules: "",
    listingTerms: "",
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("vencome_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Property not found");
        const data = await response.json();
        const p = data.property || data;

        const pricing = {
          hourly: { enabled: false, price: "" },
          daily: { enabled: false, price: "" },
          weekly: { enabled: false, price: "" },
          monthly: { enabled: false, price: "" },
          annual: { enabled: false, price: "" },
        };

        if (p.pricing) {
          Object.keys(pricing).forEach((key) => {
            const val = p.pricing[key];
            if (typeof val === "object" && val !== null) {
              pricing[key] = {
                enabled: val.enabled || false,
                price: val.price?.toString() || "",
              };
            } else if (typeof val === "number" && val > 0) {
              pricing[key] = { enabled: true, price: val.toString() };
            }
          });
        }

        setFormData({
          title: p.title || "",
          description: p.description || "",
          whatsIncluded: p.whatsIncluded || "",
          category: p.category?._id || p.category || "",
          address: p.location?.address || "",
          city: p.location?.city || "",
          country: p.location?.country || "",
          postcode: p.location?.postcode || "",
          lat: p.coordinates?.lat || p.coordinates?.latitude || null,
          lng: p.coordinates?.lng || p.coordinates?.longitude || null,
          photos: [],
          photoUrls: p.images || [],
          extras: p.extras || [],
          pricing,
          customDayPricingEnabled: (p.pricing?.customDayPricing?.length || 0) > 0,
          customDayPricing: p.pricing?.customDayPricing || [],
          singleDayOnly: p.bookingSettings?.singleDayOnly || false,
          discounts: {
            newListing: p.pricing?.discounts?.newListing || false,
            lastMinute: p.pricing?.discounts?.lastMinute || false,
            weekly: p.pricing?.discounts?.weekly || false,
            monthly: p.pricing?.discounts?.monthly || false,
            extendedHours: p.pricing?.discounts?.extendedHours || 0,
          },
          blockedDates: p.blockedDates || [],
          leaseAgreement: p.leaseAgreement || null,
          availability: {
            openDays: p.availability?.openDays || [],
            openTime: p.availability?.openTime || "",
            closeTime: p.availability?.closeTime || "",
            minNotice: p.availability?.minNotice || "",
            instantBook: p.bookingSettings?.instantBook || false,
          },
          bufferTime: {
            before: p.bookingSettings?.bufferBefore || "",
            after: p.bookingSettings?.bufferAfter || "",
          },
          capacity:
            p.features?.capacity?.toString() ||
            p.features?.seatCapacity?.toString() ||
            "",
          unitsCount: (p.unitsCount || 1).toString(),
          amenities: p.features?.amenities || [],
          rules:
            p.features?.houseRules ||
            p.features?.spaceRules ||
            p.houseRules ||
            p.spaceRules ||
            "",
          listingTerms: p.listingTerms || "",
        });

        setCalendarUrl(p.icalUrl || "");
        setCalendarSavedUrl(p.icalUrl || "");
        setCalendarLastSynced(p.icalLastSyncedAt || null);
        setCalendarSyncError(p.icalLastSyncError || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleSaveCalendarUrl = async () => {
    setSavingCalendar(true);
    setCalendarMessage("");
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/properties/${id}/calendar-sync`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ icalUrl: calendarUrl.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCalendarMessage(data.error || "Failed to save calendar URL");
        return;
      }
      setCalendarSavedUrl(data.icalUrl || "");
      setCalendarLastSynced(null);
      setCalendarSyncError(null);
      setCalendarMessage(data.icalUrl ? "Calendar connected" : "Calendar disconnected");
    } catch {
      setCalendarMessage("Failed to save calendar URL");
    } finally {
      setSavingCalendar(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncingCalendar(true);
    setCalendarMessage("");
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/properties/${id}/calendar-sync/run`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCalendarSyncError(data.error || "Sync failed");
        setCalendarMessage(data.error || "Sync failed");
        return;
      }
      setCalendarLastSynced(data.lastSyncedAt);
      setCalendarSyncError(null);
      setCalendarMessage(`Synced — ${data.synced} event(s) blocked`);
    } catch {
      setCalendarMessage("Sync failed");
    } finally {
      setSyncingCalendar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("vencome_token");

      const flatPricing = {};
      Object.entries(formData.pricing).forEach(([key, val]) => {
        if (val.enabled && val.price) {
          flatPricing[key] = parseFloat(val.price);
        }
      });
      // Always send this explicitly (even empty) -- the server replaces
      // property.pricing wholesale on save, so omitting it here would
      // silently wipe out any customDayPricing set previously.
      flatPricing.customDayPricing = formData.customDayPricingEnabled
        ? formData.customDayPricing
        : [];

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("whatsIncluded", formData.whatsIncluded || "");
      payload.append("listingTerms", formData.listingTerms || "");
      payload.append("pricing", JSON.stringify(flatPricing));
      payload.append(
        "location",
        JSON.stringify({
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postcode: formData.postcode,
        })
      );
      payload.append(
        "coordinates",
        JSON.stringify({
          lat: formData.lat,
          lng: formData.lng,
        })
      );
      payload.append(
        "features",
        JSON.stringify({
          capacity: parseInt(formData.capacity, 10) || 0,
          amenities: formData.amenities || [],
          houseRules: formData.rules || "",
        })
      );
      payload.append("unitsCount", formData.unitsCount || "1");
      payload.append(
        "bookingSettings",
        JSON.stringify({
          instantBook: formData.availability.instantBook,
          bufferBefore: formData.bufferTime.before,
          bufferAfter: formData.bufferTime.after,
          singleDayOnly: formData.pricing.daily?.enabled ? !!formData.singleDayOnly : false,
        })
      );
      payload.append(
        "availability",
        JSON.stringify({
          openDays: formData.availability.openDays,
          openTime: formData.availability.openTime,
          closeTime: formData.availability.closeTime,
          minNotice: formData.availability.minNotice,
        })
      );
      payload.append("discounts", JSON.stringify(formData.discounts || {}));
      payload.append("blockedDates", JSON.stringify(formData.blockedDates || []));
      payload.append("extras", JSON.stringify(formData.extras || []));

      if (formData.leaseAgreement instanceof File) {
        payload.append("leaseFile", formData.leaseAgreement);
      } else if (typeof formData.leaseAgreement === "string" && formData.leaseAgreement) {
        payload.append("existingLeaseAgreement", formData.leaseAgreement);
      }

      formData.photos.forEach((photo) => {
        payload.append("images", photo);
      });

      console.log(
        "Sending features:",
        JSON.stringify({
          capacity: parseInt(formData.capacity) || 0,
          amenities: formData.amenities || [],
          houseRules: formData.rules || "",
        })
      );
      console.log("Sending whatsIncluded:", formData.whatsIncluded);
      console.log("formData.rules value:", formData.rules);
      console.log("formData.capacity value:", formData.capacity);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccessModal(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Deletes an already-saved photo immediately (not deferred to "Save
  // Changes") -- it hits R2 storage and the property doc directly via the
  // existing DELETE /:id/images endpoint, same as new-photo uploads are
  // immediate on Save but existing-photo removal has always been a live
  // action in this app's photo pipeline.
  const handleDeletePhoto = async (url) => {
    setPhotoError("");
    setDeletingPhotoUrl(url);
    try {
      const token = localStorage.getItem("vencome_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/${id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageUrls: [url] }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to delete photo");
      setFormData((prev) => ({
        ...prev,
        photoUrls: prev.photoUrls.filter((u) => u !== url),
      }));
    } catch (err) {
      setPhotoError(err.message || "Failed to delete photo. Please try again.");
    } finally {
      setDeletingPhotoUrl(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem("vencome_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete listing");
      }
      navigate("/host/listings");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete listing. Please try again.");
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout title="Edit Space">
        <div style={{ textAlign: "center", padding: "60px", color: "#6B7280" }}>
          Loading property...
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout title="Edit Space">
        <div style={{ textAlign: "center", padding: "60px", color: "#EF4444" }}>{error}</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout title="Edit Space">
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#0A1628",
                margin: 0,
              }}
            >
              Edit Listing
            </h1>
            <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "4px" }}>
              Update your listing details below
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "#9CA3AF" : "#0A1628",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#0A1628",
              marginBottom: "16px",
            }}
          >
            Basic Details
          </h3>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Title
            </label>
            <input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={5}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              What's Included
            </label>
            <textarea
              value={formData.whatsIncluded}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, whatsIncluded: e.target.value }))
              }
              rows={3}
              placeholder="e.g. High-speed WiFi, Parking, AV equipment, Kitchen access"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginBottom: "16px" }}>
            Photos
          </h3>

          {photoError && (
            <p style={{ fontSize: "13px", color: "#DC2626", marginBottom: "12px" }}>{photoError}</p>
          )}

          {formData.photoUrls.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              {formData.photoUrls.map((url) => (
                <div
                  key={url}
                  style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1.5px solid #E5E7EB" }}
                >
                  <img
                    src={url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "110px",
                      objectFit: "cover",
                      display: "block",
                      opacity: deletingPhotoUrl === url ? 0.4 : 1,
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Delete photo"
                    onClick={() => handleDeletePhoto(url)}
                    disabled={deletingPhotoUrl === url}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      border: "none",
                      cursor: deletingPhotoUrl === url ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {deletingPhotoUrl === url ? "…" : "×"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.photos.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              {formData.photos.map((file, index) => (
                <div
                  key={index}
                  style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1.5px solid #305CDE" }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    style={{ width: "100%", height: "110px", objectFit: "cover", display: "block" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      left: "4px",
                      background: "rgba(48,92,222,0.9)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "999px",
                    }}
                  >
                    NEW
                  </span>
                  <button
                    type="button"
                    aria-label="Remove new photo"
                    onClick={() => {
                      const updated = formData.photos.filter((_, i) => i !== index);
                      setFormData((prev) => ({ ...prev, photos: updated }));
                    }}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px 20px",
              border: "2px dashed #E5E7EB",
              borderRadius: "12px",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
                e.target.value = "";
              }}
            />
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628", margin: "0 0 4px" }}>
              Click to add photos
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
              JPEG, PNG, WebP up to 10MB each
            </p>
          </label>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", margin: 0 }}>Add-ons</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>
                Optional add-ons guests can include in their booking
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, extras: [...(prev.extras || []), { name: "", price: "" }] }))
              }
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#0A1628",
                color: "#fff",
                border: "none",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              + Add Add-on
            </button>
          </div>

          {(formData.extras || []).length === 0 ? (
            <div
              style={{
                padding: "24px",
                border: "1.5px dashed #E5E7EB",
                borderRadius: "12px",
                textAlign: "center",
                color: "#9CA3AF",
                fontSize: "14px",
              }}
            >
              No add-ons added yet. Click "Add Add-on" to add one.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {formData.extras.map((extra, index) => (
                <div key={index} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Add-on name (e.g. Projector, Catering)"
                    value={extra.name}
                    onChange={(e) => {
                      const updated = [...formData.extras];
                      updated[index] = { ...updated[index], name: e.target.value };
                      setFormData((prev) => ({ ...prev, extras: updated }));
                    }}
                    style={{
                      flex: 2,
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #E5E7EB",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628" }}>£</span>
                    <input
                      type="number"
                      placeholder="Price"
                      value={extra.price}
                      onChange={(e) => {
                        const updated = [...formData.extras];
                        updated[index] = { ...updated[index], price: e.target.value };
                        setFormData((prev) => ({ ...prev, extras: updated }));
                      }}
                      style={{
                        width: "100px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1.5px solid #E5E7EB",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Remove add-on"
                    onClick={() => {
                      const updated = formData.extras.filter((_, i) => i !== index);
                      setFormData((prev) => ({ ...prev, extras: updated }));
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#DC2626",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "4px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#0A1628",
              marginBottom: "16px",
            }}
          >
            Pricing
          </h3>
          {[
            { key: "hourly", label: "Per Hour" },
            { key: "daily", label: "Per Day" },
            { key: "weekly", label: "Per Week" },
            { key: "monthly", label: "Per Month" },
            { key: "annual", label: "Per Year" },
          ].map(({ key, label }) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <input
                type="checkbox"
                checked={formData.pricing[key]?.enabled || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: {
                      ...prev.pricing,
                      [key]: { ...prev.pricing[key], enabled: e.target.checked },
                    },
                  }))
                }
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0A1628",
                  minWidth: "90px",
                }}
              >
                {label}
              </label>
              {formData.pricing[key]?.enabled && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <span style={{ fontWeight: "700", color: "#0A1628" }}>£</span>
                  <input
                    type="number"
                    value={formData.pricing[key]?.price || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          [key]: { ...prev.pricing[key], price: e.target.value },
                        },
                      }))
                    }
                    placeholder="0"
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #E5E7EB",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {(formData.pricing.hourly?.enabled || formData.pricing.daily?.enabled) && (
            <DayOfWeekPricing
              enabled={formData.customDayPricingEnabled}
              customDayPricing={formData.customDayPricing}
              onChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
            />
          )}

          {formData.pricing.daily?.enabled && (
            <div
              style={{ marginTop: "24px", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
              onClick={() => setFormData((prev) => ({ ...prev, singleDayOnly: !prev.singleDayOnly }))}
            >
              <div>
                <p style={{ fontWeight: "700", color: "#0A1628", fontSize: "15px", margin: 0 }}>
                  Single-day bookings only
                </p>
                <p style={{ color: "#6B7280", fontSize: "13px", margin: "2px 0 0" }}>
                  Like a one-way flight — guests can only book one calendar day at a time, not a multi-night stay
                </p>
              </div>
              <button
                type="button"
                aria-label={formData.singleDayOnly ? "Disable single-day-only bookings" : "Enable single-day-only bookings"}
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData((prev) => ({ ...prev, singleDayOnly: !prev.singleDayOnly }));
                }}
                style={{
                  width: "48px", height: "26px", borderRadius: "9999px",
                  background: formData.singleDayOnly ? "#0A1628" : "#E5E7EB",
                  border: "none", cursor: "pointer", position: "relative",
                  transition: "background 0.2s ease", flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute", top: "3px",
                    left: formData.singleDayOnly ? "25px" : "3px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginBottom: "16px" }}>
            Discounts
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { key: "newListing", title: "New Listing Promotion (20%)", description: "Automatic 20% discount on your first few bookings." },
              { key: "lastMinute", title: "Last Minute Discount (1%)", description: "Small savings for guests booking within a few days of arrival." },
              { key: "weekly", title: "Weekly Discount (10%)", description: "Reward guests who stay for 7 days or more." },
              { key: "monthly", title: "Monthly Discount (20%)", description: "Attract long-term stays with generous monthly savings." },
            ].map((discount) => {
              const enabled = formData.discounts?.[discount.key] || false;
              return (
                <div
                  key={discount.key}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      discounts: { ...prev.discounts, [discount.key]: !enabled },
                    }))
                  }
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                    padding: "16px",
                    borderRadius: "10px",
                    border: `1.5px solid ${enabled ? "#0A1628" : "#E5E7EB"}`,
                    background: enabled ? "rgba(10,22,40,0.02)" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#0A1628", margin: "0 0 4px" }}>
                      {discount.title}
                    </p>
                    <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
                      {discount.description}
                    </p>
                  </div>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      flexShrink: 0,
                      border: `2px solid ${enabled ? "#0A1628" : "#D1D5DB"}`,
                      background: enabled ? "#0A1628" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {enabled && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                padding: "16px",
                borderRadius: "10px",
                border: `1.5px solid ${Number(formData.discounts?.extendedHours) > 0 ? "#0A1628" : "#E5E7EB"}`,
                background: Number(formData.discounts?.extendedHours) > 0 ? "rgba(10,22,40,0.02)" : "#fff",
              }}
            >
              <div>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#0A1628", margin: "0 0 4px" }}>
                  Extended Hours Discount
                </p>
                <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
                  Offer your own discount for hourly bookings longer than 3 hours. Set to 0 to disable.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discounts?.extendedHours || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discounts: { ...prev.discounts, extendedHours: e.target.value === "" ? 0 : Number(e.target.value) },
                    }))
                  }
                  placeholder="0"
                  style={{
                    width: "60px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1.5px solid #E5E7EB",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0A1628",
                    textAlign: "center",
                  }}
                />
                <span style={{ fontSize: "14px", color: "#6B7280" }}>%</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#0A1628",
              marginBottom: "16px",
            }}
          >
            Availability
          </h3>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
              Open Days
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                const selected = formData.availability.openDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          openDays: selected
                            ? prev.availability.openDays.filter((d) => d !== day)
                            : [...prev.availability.openDays, day],
                        },
                      }))
                    }
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: `1.5px solid ${selected ? "#0A1628" : "#E5E7EB"}`,
                      background: selected ? "rgba(10,22,40,0.03)" : "#fff",
                      color: selected ? "#0A1628" : "#111827",
                      fontSize: "13px",
                      fontWeight: selected ? "600" : "400",
                      cursor: "pointer",
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Open Time
              </label>
              <input
                type="time"
                value={formData.availability.openTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    availability: { ...prev.availability, openTime: e.target.value },
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1.5px solid #E5E7EB",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Close Time
              </label>
              <input
                type="time"
                value={formData.availability.closeTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    availability: { ...prev.availability, closeTime: e.target.value },
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1.5px solid #E5E7EB",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={formData.availability.instantBook}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  availability: { ...prev.availability, instantBook: e.target.checked },
                }))
              }
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628" }}>
              Enable Instant Book
            </label>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginBottom: "8px" }}>
            Block Dates
          </h3>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
            Click dates to mark them as unavailable. Guests cannot book these dates.
          </p>
          <BlockDatesEditor
            blockedDates={formData.blockedDates}
            onChange={(next) => setFormData((prev) => ({ ...prev, blockedDates: next }))}
            unitsCount={Number(formData.unitsCount) || 1}
          />
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginBottom: "8px" }}>
            Calendar Sync
          </h3>
          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
            Connect an external calendar (Google Calendar, Outlook, Apple iCal, Calendly, Cal.com) via its
            shareable iCal (.ics) URL. Events on that calendar will block dates on this listing automatically
            every few hours, or sync instantly with the button below.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
              value={calendarUrl}
              onChange={(e) => setCalendarUrl(e.target.value)}
              style={{
                flex: 1,
                minWidth: "220px",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleSaveCalendarUrl}
              disabled={savingCalendar || calendarUrl === calendarSavedUrl}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1.5px solid #0A1628",
                background: "white",
                color: "#0A1628",
                fontWeight: 600,
                fontSize: "14px",
                cursor: savingCalendar || calendarUrl === calendarSavedUrl ? "not-allowed" : "pointer",
                opacity: savingCalendar || calendarUrl === calendarSavedUrl ? 0.5 : 1,
              }}
            >
              {savingCalendar ? "Saving..." : "Save"}
            </button>
            {calendarSavedUrl ? (
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={syncingCalendar}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#0A1628",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: syncingCalendar ? "not-allowed" : "pointer",
                  opacity: syncingCalendar ? 0.7 : 1,
                }}
              >
                {syncingCalendar ? "Syncing..." : "Sync Now"}
              </button>
            ) : null}
          </div>
          {calendarMessage ? (
            <p style={{ fontSize: 13, color: calendarSyncError ? "#DC2626" : "#16A34A", marginBottom: 4 }}>
              {calendarMessage}
            </p>
          ) : null}
          {calendarSavedUrl ? (
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>
              {calendarLastSynced
                ? `Last synced ${new Date(calendarLastSynced).toLocaleString("en-GB")}`
                : "Not synced yet — click Sync Now"}
            </p>
          ) : null}
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#0A1628",
              marginBottom: "16px",
            }}
          >
            Space Details
          </h3>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Capacity
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
              onWheel={(e) => e.target.blur()}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Number of identical units
            </label>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px" }}>
              If you have several identical setups (e.g. 5 identical chairs), guests can book any one
              of them independently — up to this many bookings can overlap at once.
            </p>
            <input
              type="number"
              min="1"
              value={formData.unitsCount}
              onChange={(e) => setFormData((prev) => ({ ...prev, unitsCount: e.target.value }))}
              onWheel={(e) => e.target.blur()}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Space Rules
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData((prev) => ({ ...prev, rules: e.target.value }))}
              rows={3}
              placeholder="e.g. No smoking, No events after 10pm"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Listing Terms (optional)
            </label>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px" }}>
              Your own terms for this space -- shown to customers as a "Read More" on
              the listing, and they'll need to agree before booking. Separate from
              VenCome's platform Terms &amp; Conditions. Leave blank if not needed.
            </p>
            <textarea
              value={formData.listingTerms}
              onChange={(e) => setFormData((prev) => ({ ...prev, listingTerms: e.target.value }))}
              rows={5}
              placeholder="e.g. All bookings require a 20% refundable damage deposit, paid separately on arrival..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "24px",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginBottom: "16px" }}>
            Lease Agreement
          </h3>
          {!formData.leaseAgreement ? (
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 24px",
                border: "2px dashed #E5E7EB",
                borderRadius: "12px",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setFormData((prev) => ({ ...prev, leaseAgreement: file }));
                }}
              />
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628", margin: "0 0 4px" }}>
                Click to upload lease agreement
              </p>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>PDF, DOC or DOCX up to 10MB</p>
            </label>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                border: "1.5px solid #86EFAC",
                borderRadius: "10px",
                background: "#F0FDF4",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628", margin: 0 }}>
                {formData.leaseAgreement instanceof File ? formData.leaseAgreement.name : "Lease agreement uploaded"}
              </p>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, leaseAgreement: null }))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", fontSize: "13px", fontWeight: "600" }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", paddingBottom: "40px" }}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              background: "#fff",
              color: "#DC2626",
              border: "1.5px solid #FCA5A5",
              borderRadius: "10px",
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Delete Listing
          </button>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => navigate("/host/listings")}
              style={{
                background: "#fff",
                color: "#0A1628",
                border: "1.5px solid #E5E7EB",
                borderRadius: "10px",
                padding: "12px 24px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Back to Listings
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? "#9CA3AF" : "#0A1628",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 24px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {showDeleteConfirm ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,22,40,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "28px",
                maxWidth: "420px",
                width: "100%",
                boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0A1628", marginBottom: "10px" }}>
                Delete this listing?
              </h2>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: "1.6", marginBottom: "20px" }}>
                This will permanently remove the listing from VenCome. This action cannot be undone.
              </p>
              {deleteError ? (
                <p style={{ fontSize: "13px", color: "#DC2626", marginBottom: "16px" }}>
                  {deleteError}
                </p>
              ) : null}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  style={{
                    background: "#fff",
                    color: "#0A1628",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "10px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: deleting ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    background: deleting ? "#FCA5A5" : "#DC2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: deleting ? "not-allowed" : "pointer",
                  }}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {successModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "40px 32px",
                width: "90%",
                maxWidth: "460px",
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#0A1628",
                  marginBottom: "12px",
                }}
              >
                Listing Updated
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "#6B7280",
                  lineHeight: "1.6",
                  marginBottom: "24px",
                }}
              >
                Your changes have been saved successfully.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/host/listings")}
                  style={{
                    background: "#0A1628",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  View Listings
                </button>
                <button
                  onClick={() => setSuccessModal(false)}
                  style={{
                    background: "#fff",
                    color: "#0A1628",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "10px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Stay Here
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
