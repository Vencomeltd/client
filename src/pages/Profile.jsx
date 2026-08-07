import { useState, useEffect, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import apiFetch from "../utils/apiClient";
import { updateStoredUser } from "../utils/auth";
import PhoneNumberField from "../components/PhoneNumberField";
import EmailField from "../components/EmailField";

const API = import.meta.env.VITE_API_URL;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch("/auth/me");
        const data = await res.json();
        setUser(data);
        setImagePreview(data.profileImage || null);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("displayName", user.displayName || "");
      formData.append("firstName", user.firstName || "");
      formData.append("lastName", user.lastName || "");
      formData.append("bio", user.bio || "");
      if (imageFile) formData.append("profileImage", imageFile);

      const res = await apiFetch("/profile", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      setUser(data);
      updateStoredUser({
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        profileImage: data.profileImage,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout title="Profile">
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader2 size={32} className="animate-spin" color="#2E58EC" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Profile">
      <div style={{ maxWidth: "640px" }}>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "36px" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: "96px", height: "96px", borderRadius: "50%",
              background: "#E5E7EB", overflow: "hidden",
              border: "3px solid #fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: "100%", height: "100%", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "32px", fontWeight: "700", color: "#0A1628",
                  background: "rgba(46,88,236,0.1)",
                }}>
                  {(user?.firstName?.[0] || user?.displayName?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Change profile photo"
              onClick={() => fileRef.current?.click()}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: "28px", height: "28px", borderRadius: "50%",
                background: "#0A1628", border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Camera size={14} color="#fff" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          </div>
          <div>
            <p style={{ fontSize: "20px", fontWeight: "700", color: "#0A1628" }}>
              {user?.displayName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Your Profile"}
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>{user?.email}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ fontSize: "13px", color: "#2E58EC", fontWeight: "600", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "6px" }}
            >
              Change photo
            </button>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#0A1628", display: "block", marginBottom: "8px" }}>
                First Name
              </label>
              <input
                type="text"
                value={user?.firstName || ""}
                onChange={(e) => setUser(prev => ({ ...prev, firstName: e.target.value }))}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: "10px",
                  border: "1.5px solid #E5E7EB", fontSize: "14px",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#0A1628", display: "block", marginBottom: "8px" }}>
                Last Name
              </label>
              <input
                type="text"
                value={user?.lastName || ""}
                onChange={(e) => setUser(prev => ({ ...prev, lastName: e.target.value }))}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: "10px",
                  border: "1.5px solid #E5E7EB", fontSize: "14px",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#0A1628", display: "block", marginBottom: "8px" }}>
              Display Name
            </label>
            <input
              type="text"
              value={user?.displayName || ""}
              onChange={(e) => setUser(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="How your name appears to guests"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "10px",
                border: "1.5px solid #E5E7EB", fontSize: "14px",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <EmailField
            value={user?.email}
            onChanged={(email) => {
              setUser(prev => ({ ...prev, email }));
              updateStoredUser({ email });
            }}
          />

          <PhoneNumberField
            value={user?.phoneNumber}
            verified={user?.isPhoneVerified}
            onVerified={(phoneNumber, isPhoneVerified) => {
              setUser(prev => ({ ...prev, phoneNumber, isPhoneVerified }));
              updateStoredUser({ phoneNumber });
            }}
          />

          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#0A1628", display: "block", marginBottom: "8px" }}>
              Bio
            </label>
            <textarea
              value={user?.bio || ""}
              onChange={(e) => setUser(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell guests a bit about yourself..."
              rows={4}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "10px",
                border: "1.5px solid #E5E7EB", fontSize: "14px",
                outline: "none", resize: "none", fontFamily: "inherit",
                lineHeight: "1.6", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#EF4444", fontSize: "13px" }}>{error}</p>
          )}

          {success && (
            <div style={{
              padding: "12px 16px", borderRadius: "10px",
              background: "#F0FDF4", border: "1px solid #86EFAC",
              color: "#16A34A", fontSize: "14px", fontWeight: "600",
            }}>
              Profile saved successfully!
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "14px 32px", borderRadius: "10px", border: "none",
              background: saving ? "#9CA3AF" : "#2E58EC",
              color: "#fff", fontSize: "15px", fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: "8px",
              alignSelf: "flex-start",
            }}
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
