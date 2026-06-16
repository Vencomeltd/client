import { useState, useEffect } from "react";
import { Loader2, Bell, Lock, CreditCard, Building2, Shield } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import apiFetch from "../utils/apiClient";
import { toast } from "react-toastify";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMessages: true,
    emailMarketing: false,
    smsBookings: false,
    smsReminders: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch("/auth/me");
        const data = await res.json();
        setUser(data);
        if (data.notifications) setNotifications(data.notifications);
      } catch (err) {
        console.error("Failed to load user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleAccountSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/settings/personal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address || {},
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Account settings saved");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPass.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update password");
      }
      toast.success("Password updated successfully");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch("/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Notification preferences saved");
    } catch (err) {
      toast.error(err.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { key: "account", label: "Account", icon: Shield },
    { key: "password", label: "Password", icon: Lock },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "payout", label: "Payouts", icon: Building2 },
  ];

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: "1.5px solid #E5E7EB", fontSize: "14px", color: "#111827",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: "13px", fontWeight: "700", color: "#0A1628",
    display: "block", marginBottom: "8px",
  };

  const sectionTitle = {
    fontSize: "18px", fontWeight: "700", color: "#0A1628",
    marginBottom: "20px",
  };

  const saveBtn = (onClick) => (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      style={{
        padding: "12px 28px", borderRadius: "10px", border: "none",
        background: saving ? "#9CA3AF" : "#2E58EC",
        color: "#fff", fontSize: "14px", fontWeight: "600",
        cursor: saving ? "not-allowed" : "pointer",
        display: "inline-flex", alignItems: "center", gap: "8px",
        marginTop: "8px",
      }}
    >
      {saving && <Loader2 size={14} className="animate-spin" />}
      {saving ? "Saving..." : "Save Changes"}
    </button>
  );

  const Toggle = ({ value, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: "48px", height: "26px", borderRadius: "9999px",
        background: value ? "#2E58EC" : "#E5E7EB",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.2s ease", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: "3px",
        left: value ? "25px" : "3px",
        width: "20px", height: "20px", borderRadius: "50%",
        background: "#fff", transition: "left 0.2s ease",
      }} />
    </button>
  );

  if (loading) return (
    <DashboardLayout title="Settings">
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader2 size={32} className="animate-spin" color="#2E58EC" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Settings">
      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>

        {/* Sidebar tabs */}
        <div style={{
          width: "200px", flexShrink: 0,
          background: "#fff", borderRadius: "14px",
          border: "1px solid #E5E7EB", padding: "8px",
        }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: "10px", padding: "11px 14px", borderRadius: "10px",
                border: "none", cursor: "pointer", textAlign: "left",
                fontSize: "14px", fontWeight: activeTab === key ? "700" : "500",
                background: activeTab === key ? "rgba(46,88,236,0.08)" : "transparent",
                color: activeTab === key ? "#2E58EC" : "#374151",
                marginBottom: "2px",
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", padding: "28px" }}>

          {activeTab === "account" && (
            <div>
              <p style={sectionTitle}>Account Information</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input style={inputStyle} value={user?.firstName || ""} onChange={e => setUser(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input style={inputStyle} value={user?.lastName || ""} onChange={e => setUser(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input style={{ ...inputStyle, background: "#F9FAFB", color: "#9CA3AF" }} value={user?.email || ""} disabled />
                  <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>Contact support to change your email</p>
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input style={inputStyle} value={user?.phoneNumber || ""} onChange={e => setUser(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="+44 7700 900000" />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input style={inputStyle} value={user?.address?.country || ""} onChange={e => setUser(p => ({ ...p, address: { ...p.address, country: e.target.value } }))} placeholder="United Kingdom" />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={user?.address?.city || ""} onChange={e => setUser(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} placeholder="London" />
                </div>
                {saveBtn(handleAccountSave)}
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div>
              <p style={sectionTitle}>Change Password</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "440px" }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input type="password" style={inputStyle} value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} placeholder="Enter current password" />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" style={inputStyle} value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} placeholder="At least 8 characters" />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input type="password" style={inputStyle} value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
                </div>
                {saveBtn(handlePasswordSave)}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <p style={sectionTitle}>Notification Preferences</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { key: "emailBookings", label: "Booking confirmations", sub: "Get emailed when a booking is confirmed or cancelled" },
                  { key: "emailMessages", label: "New messages", sub: "Get emailed when you receive a new message" },
                  { key: "emailMarketing", label: "Tips and promotions", sub: "Receive occasional tips, deals, and platform updates" },
                  { key: "smsBookings", label: "SMS booking alerts", sub: "Receive SMS for booking confirmations" },
                  { key: "smsReminders", label: "SMS check-in reminders", sub: "Receive SMS reminders before your booking" },
                ].map(({ key, label, sub }) => (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 0", borderBottom: "1px solid #F3F4F6",
                  }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628", margin: "0 0 2px" }}>{label}</p>
                      <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>{sub}</p>
                    </div>
                    <Toggle
                      value={notifications[key]}
                      onChange={(val) => setNotifications(p => ({ ...p, [key]: val }))}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "20px" }}>
                {saveBtn(handleNotificationSave)}
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              <p style={sectionTitle}>Payment Methods</p>
              <div style={{
                padding: "40px 24px", textAlign: "center",
                border: "1.5px dashed #E5E7EB", borderRadius: "12px",
              }}>
                <CreditCard size={40} color="#D1D5DB" style={{ marginBottom: "12px" }} />
                <p style={{ fontSize: "15px", fontWeight: "600", color: "#0A1628", marginBottom: "6px" }}>
                  Payment methods
                </p>
                <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
                  Your saved payment methods will appear here.
                </p>
              </div>
            </div>
          )}

          {activeTab === "payout" && (
            <div>
              <p style={sectionTitle}>Payout Settings</p>
              <div style={{
                padding: "40px 24px", textAlign: "center",
                border: "1.5px dashed #E5E7EB", borderRadius: "12px",
              }}>
                <Building2 size={40} color="#D1D5DB" style={{ marginBottom: "12px" }} />
                <p style={{ fontSize: "15px", fontWeight: "600", color: "#0A1628", marginBottom: "6px" }}>
                  Payout methods
                </p>
                <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
                  Add a bank account or card to receive your payouts.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
