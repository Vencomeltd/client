import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

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
    pricing: {
      hourly: { enabled: false, price: "" },
      daily: { enabled: false, price: "" },
      weekly: { enabled: false, price: "" },
      monthly: { enabled: false, price: "" },
      annual: { enabled: false, price: "" },
    },
    availability: {
      openDays: [],
      openTime: "",
      closeTime: "",
      minNotice: "",
      instantBook: false,
    },
    bufferTime: { before: "", after: "" },
    capacity: "",
    amenities: [],
    rules: "",
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
          pricing,
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
          amenities: p.features?.amenities || [],
          rules:
            p.features?.houseRules ||
            p.features?.spaceRules ||
            p.houseRules ||
            p.spaceRules ||
            "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

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

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("whatsIncluded", formData.whatsIncluded || "");
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
      payload.append(
        "bookingSettings",
        JSON.stringify({
          instantBook: formData.availability.instantBook,
          bufferBefore: formData.bufferTime.before,
          bufferAfter: formData.bufferTime.after,
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
