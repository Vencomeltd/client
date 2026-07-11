import { useState, useEffect } from "react";
import { Loader2, Bell, Lock, CreditCard, Building2, Shield, BadgeCheck, CheckCircle2, AlertCircle, Wallet, CalendarDays } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import apiFetch from "../utils/apiClient";
import { toast } from "react-toastify";
import IdentityVerification from "../components/IdentityVerification";
import BusinessVerification from "../components/BusinessVerification";

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
  const [payoutStatus, setPayoutStatus] = useState(null);
  const [payoutStatusLoading, setPayoutStatusLoading] = useState(true);
  const [connectingPayout, setConnectingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [googleCalendar, setGoogleCalendar] = useState(null);
  const [outlookCalendar, setOutlookCalendar] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [connectingCalendar, setConnectingCalendar] = useState(false);
  const [connectingOutlook, setConnectingOutlook] = useState(false);
  const [calcomStatus, setCalcomStatus] = useState(null);
  const [calcomApiKeyInput, setCalcomApiKeyInput] = useState("");
  const [connectingCalcom, setConnectingCalcom] = useState(false);
  const [calendlyStatus, setCalendlyStatus] = useState(null);
  const [connectingCalendly, setConnectingCalendly] = useState(false);
  const [appleStatus, setAppleStatus] = useState(null);
  const [appleUsernameInput, setAppleUsernameInput] = useState("");
  const [applePasswordInput, setApplePasswordInput] = useState("");
  const [connectingApple, setConnectingApple] = useState(false);

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

  useEffect(() => {
    const fetchPayoutStatus = async () => {
      try {
        const res = await apiFetch("/payouts/connect/status");
        const data = await res.json();
        setPayoutStatus(data.status || "not_connected");
      } catch (err) {
        console.error("Failed to load payout status", err);
        setPayoutStatus("not_connected");
      } finally {
        setPayoutStatusLoading(false);
      }
    };
    fetchPayoutStatus();
  }, []);

  useEffect(() => {
    const fetchCalendarStatus = async () => {
      try {
        const [googleRes, outlookRes, calcomRes, calendlyRes, appleRes] = await Promise.all([
          apiFetch("/calendar/google/status"),
          apiFetch("/calendar/outlook/status"),
          apiFetch("/calendar/calcom/status"),
          apiFetch("/calendar/calendly/status"),
          apiFetch("/calendar/apple/status"),
        ]);
        setGoogleCalendar(await googleRes.json());
        setOutlookCalendar(await outlookRes.json());
        setCalcomStatus(await calcomRes.json());
        setCalendlyStatus(await calendlyRes.json());
        setAppleStatus(await appleRes.json());
      } catch (err) {
        console.error("Failed to load calendar status", err);
        setGoogleCalendar({ connected: false });
        setOutlookCalendar({ connected: false });
        setCalcomStatus({ connected: false });
        setCalendlyStatus({ connected: false });
        setAppleStatus({ connected: false });
      } finally {
        setCalendarLoading(false);
      }
    };
    fetchCalendarStatus();

    // Land back here from the OAuth redirect (routes/calendarSync.js) —
    // shared by both Google and Outlook.
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected") {
      toast.success("Calendar connected");
      window.history.replaceState({}, "", "/settings");
    } else if (params.get("calendar") === "error") {
      toast.error("Couldn't connect calendar — please try again");
      window.history.replaceState({}, "", "/settings");
    }
  }, []);

  const handleConnectCalendar = async () => {
    setConnectingCalendar(true);
    try {
      const res = await apiFetch("/calendar/google/connect");
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Failed to start connection");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.message || "Failed to connect Google Calendar");
      setConnectingCalendar(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    setConnectingCalendar(true);
    try {
      const res = await apiFetch("/calendar/google/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setGoogleCalendar({ connected: false });
      toast.success("Google Calendar disconnected");
    } catch (err) {
      toast.error("Failed to disconnect Google Calendar");
    } finally {
      setConnectingCalendar(false);
    }
  };

  const handleConnectOutlook = async () => {
    setConnectingOutlook(true);
    try {
      const res = await apiFetch("/calendar/outlook/connect");
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Failed to start connection");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.message || "Failed to connect Outlook");
      setConnectingOutlook(false);
    }
  };

  const handleDisconnectOutlook = async () => {
    setConnectingOutlook(true);
    try {
      const res = await apiFetch("/calendar/outlook/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setOutlookCalendar({ connected: false });
      toast.success("Outlook disconnected");
    } catch (err) {
      toast.error("Failed to disconnect Outlook");
    } finally {
      setConnectingOutlook(false);
    }
  };

  const handleConnectCalcom = async () => {
    if (!calcomApiKeyInput.trim()) {
      toast.error("Paste your Cal.com API key first");
      return;
    }
    setConnectingCalcom(true);
    try {
      const res = await apiFetch("/calendar/calcom/connect", {
        method: "POST",
        body: JSON.stringify({ apiKey: calcomApiKeyInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect");
      setCalcomStatus({ connected: true, username: data.username });
      setCalcomApiKeyInput("");
      toast.success("Cal.com connected");
    } catch (err) {
      toast.error(err.message || "Couldn't verify that Cal.com API key");
    } finally {
      setConnectingCalcom(false);
    }
  };

  const handleDisconnectCalcom = async () => {
    setConnectingCalcom(true);
    try {
      const res = await apiFetch("/calendar/calcom/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setCalcomStatus({ connected: false });
      toast.success("Cal.com disconnected");
    } catch (err) {
      toast.error("Failed to disconnect Cal.com");
    } finally {
      setConnectingCalcom(false);
    }
  };

  const handleConnectCalendly = async () => {
    setConnectingCalendly(true);
    try {
      const res = await apiFetch("/calendar/calendly/connect");
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Failed to start connection");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.message || "Failed to connect Calendly");
      setConnectingCalendly(false);
    }
  };

  const handleDisconnectCalendly = async () => {
    setConnectingCalendly(true);
    try {
      const res = await apiFetch("/calendar/calendly/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setCalendlyStatus({ connected: false });
      toast.success("Calendly disconnected");
    } catch (err) {
      toast.error("Failed to disconnect Calendly");
    } finally {
      setConnectingCalendly(false);
    }
  };

  const handleConnectApple = async () => {
    if (!appleUsernameInput.trim() || !applePasswordInput.trim()) {
      toast.error("Enter your Apple ID and app-specific password first");
      return;
    }
    setConnectingApple(true);
    try {
      const res = await apiFetch("/calendar/apple/connect", {
        method: "POST",
        body: JSON.stringify({
          username: appleUsernameInput.trim(),
          password: applePasswordInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect");
      setAppleStatus({ connected: true, username: data.username });
      setAppleUsernameInput("");
      setApplePasswordInput("");
      toast.success("Apple Calendar connected");
    } catch (err) {
      toast.error(err.message || "Couldn't connect — check the Apple ID and app-specific password");
    } finally {
      setConnectingApple(false);
    }
  };

  const handleDisconnectApple = async () => {
    setConnectingApple(true);
    try {
      const res = await apiFetch("/calendar/apple/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setAppleStatus({ connected: false });
      toast.success("Apple Calendar disconnected");
    } catch (err) {
      toast.error("Failed to disconnect Apple Calendar");
    } finally {
      setConnectingApple(false);
    }
  };

  const handleConnectPayout = async () => {
    setConnectingPayout(true);
    setPayoutError("");
    try {
      const res = await apiFetch("/payouts/connect/onboarding-link", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Failed to start onboarding");
      window.location.href = data.url;
    } catch (err) {
      setPayoutError(err.message || "Failed to start onboarding");
      setConnectingPayout(false);
    }
  };

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
    { key: "calendar", label: "Calendar Sync", icon: CalendarDays },
    { key: "verification", label: "Verification", icon: BadgeCheck },
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
              <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
                Choose how you'd like to receive your payouts.
              </p>

              {payoutStatusLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <Loader2 size={24} className="animate-spin" color="#2E58EC" />
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
                    {/* Bank Account — the real, working option */}
                    <div style={{
                      border: payoutStatus === "connected" ? "1.5px solid rgba(22,163,74,0.4)" : "1.5px solid #2E58EC",
                      borderRadius: "14px", padding: "20px",
                      background: payoutStatus === "connected" ? "rgba(22,163,74,0.04)" : "rgba(46,88,236,0.04)",
                    }}>
                      <Building2 size={26} color={payoutStatus === "connected" ? "#16A34A" : "#2E58EC"} />
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "12px 0 4px" }}>
                        Bank Account
                      </p>
                      <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "17px" }}>
                        Direct deposit via Stripe. You'll enter your account details directly with Stripe — VenCome never sees or stores them.
                      </p>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700",
                        background: payoutStatus === "connected" ? "rgba(22,163,74,0.12)" : payoutStatus === "pending" ? "rgba(217,119,6,0.12)" : "rgba(46,88,236,0.1)",
                        color: payoutStatus === "connected" ? "#16A34A" : payoutStatus === "pending" ? "#D97706" : "#2E58EC",
                      }}>
                        {payoutStatus === "connected" ? "Connected" : payoutStatus === "pending" ? "Verification pending" : "Not connected"}
                      </span>
                    </div>

                    {/* PayPal — coming soon */}
                    <div style={{
                      border: "1.5px dashed #E5E7EB", borderRadius: "14px", padding: "20px", opacity: 0.65,
                    }}>
                      <Wallet size={26} color="#D1D5DB" />
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "12px 0 4px" }}>
                        PayPal
                      </p>
                      <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "17px" }}>
                        Receive payouts directly to your PayPal account.
                      </p>
                      <span style={{
                        display: "inline-block", padding: "4px 10px", borderRadius: "9999px",
                        background: "#F3F4F6", color: "#6B7280", fontSize: "11px", fontWeight: "700",
                      }}>
                        Coming soon
                      </span>
                    </div>
                  </div>

                  <div style={{
                    padding: "20px 24px", textAlign: "center",
                    border: "1px solid #F3F4F6", borderRadius: "12px", background: "#FCFCFC",
                  }}>
                    <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
                      {payoutStatus === "connected"
                        ? "Payouts release automatically 24 hours after each completed booking."
                        : payoutStatus === "pending"
                        ? "You've started onboarding, but Stripe still needs a few more details before payouts can go out."
                        : "You'll need to connect a bank account before you can receive payouts."}
                    </p>

                    {payoutError && (
                      <p style={{ fontSize: "13px", color: "#DC2626", marginBottom: "14px" }}>{payoutError}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleConnectPayout}
                      disabled={connectingPayout}
                      style={{
                        padding: "12px 28px", borderRadius: "10px", border: "none",
                        background: connectingPayout ? "#9CA3AF" : "#2E58EC",
                        color: "#fff", fontSize: "14px", fontWeight: "600",
                        cursor: connectingPayout ? "not-allowed" : "pointer",
                        display: "inline-flex", alignItems: "center", gap: "8px",
                      }}
                    >
                      {connectingPayout && <Loader2 size={14} className="animate-spin" />}
                      {connectingPayout
                        ? "Redirecting to Stripe..."
                        : payoutStatus === "connected"
                        ? "Manage bank account"
                        : payoutStatus === "pending"
                        ? "Continue setup"
                        : "Connect bank account"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "calendar" && (
            <div>
              <p style={sectionTitle}>Calendar Sync</p>
              <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
                Connect an external calendar so bookings sync both ways — VenCome bookings show up there, and events there block VenCome availability.
              </p>

              {calendarLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <Loader2 size={24} className="animate-spin" color="#2E58EC" />
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "14px", marginBottom: "24px" }}>
                    {/* Google Calendar — the real, working option */}
                    <div style={{
                      border: googleCalendar?.connected ? "1.5px solid rgba(22,163,74,0.4)" : "1.5px solid #2E58EC",
                      borderRadius: "14px", padding: "20px",
                      background: googleCalendar?.connected ? "rgba(22,163,74,0.04)" : "rgba(46,88,236,0.04)",
                    }}>
                      <CalendarDays size={26} color={googleCalendar?.connected ? "#16A34A" : "#2E58EC"} />
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "12px 0 4px" }}>
                        Google Calendar
                      </p>
                      <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "17px" }}>
                        {googleCalendar?.connected
                          ? `Connected as ${googleCalendar.email}`
                          : "Two-way sync with your Google Calendar."}
                      </p>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700",
                        background: googleCalendar?.connected ? "rgba(22,163,74,0.12)" : "rgba(46,88,236,0.1)",
                        color: googleCalendar?.connected ? "#16A34A" : "#2E58EC",
                      }}>
                        {googleCalendar?.connected ? "Connected" : "Not connected"}
                      </span>
                    </div>

                    {/* Outlook — same live pattern as Google Calendar */}
                    <div style={{
                      border: outlookCalendar?.connected ? "1.5px solid rgba(22,163,74,0.4)" : "1.5px solid #2E58EC",
                      borderRadius: "14px", padding: "20px",
                      background: outlookCalendar?.connected ? "rgba(22,163,74,0.04)" : "rgba(46,88,236,0.04)",
                    }}>
                      <CalendarDays size={26} color={outlookCalendar?.connected ? "#16A34A" : "#2E58EC"} />
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "12px 0 4px" }}>
                        Outlook
                      </p>
                      <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "17px" }}>
                        {outlookCalendar?.connected
                          ? `Connected as ${outlookCalendar.email}`
                          : "Two-way sync with Outlook / Microsoft 365."}
                      </p>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700",
                        background: outlookCalendar?.connected ? "rgba(22,163,74,0.12)" : "rgba(46,88,236,0.1)",
                        color: outlookCalendar?.connected ? "#16A34A" : "#2E58EC",
                      }}>
                        {outlookCalendar?.connected ? "Connected" : "Not connected"}
                      </span>
                    </div>

                    {/* Cal.com — pull-only (no arbitrary "create event" API),
                        connects via a pasted personal API key instead of OAuth. */}
                    <div style={{
                      border: calcomStatus?.connected ? "1.5px solid rgba(22,163,74,0.4)" : "1.5px solid #2E58EC",
                      borderRadius: "14px", padding: "20px",
                      background: calcomStatus?.connected ? "rgba(22,163,74,0.04)" : "rgba(46,88,236,0.04)",
                    }}>
                      <CalendarDays size={26} color={calcomStatus?.connected ? "#16A34A" : "#2E58EC"} />
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "12px 0 4px" }}>
                        Cal.com
                      </p>
                      <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "17px" }}>
                        {calcomStatus?.connected
                          ? `Connected as ${calcomStatus.username || "your account"}`
                          : "Blocks VenCome dates from your existing Cal.com bookings."}
                      </p>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700",
                        background: calcomStatus?.connected ? "rgba(22,163,74,0.12)" : "rgba(46,88,236,0.1)",
                        color: calcomStatus?.connected ? "#16A34A" : "#2E58EC",
                      }}>
                        {calcomStatus?.connected ? "Connected" : "Not connected"}
                      </span>
                    </div>

                    {/* Calendly — real OAuth, same live pattern as Google/Outlook */}
                    <div style={{
                      border: calendlyStatus?.connected ? "1.5px solid rgba(22,163,74,0.4)" : "1.5px solid #2E58EC",
                      borderRadius: "14px", padding: "20px",
                      background: calendlyStatus?.connected ? "rgba(22,163,74,0.04)" : "rgba(46,88,236,0.04)",
                    }}>
                      <CalendarDays size={26} color={calendlyStatus?.connected ? "#16A34A" : "#2E58EC"} />
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "12px 0 4px" }}>
                        Calendly
                      </p>
                      <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "17px" }}>
                        {calendlyStatus?.connected
                          ? `Connected as ${calendlyStatus.email || "your account"}`
                          : "Blocks VenCome dates from your existing Calendly bookings."}
                      </p>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700",
                        background: calendlyStatus?.connected ? "rgba(22,163,74,0.12)" : "rgba(46,88,236,0.1)",
                        color: calendlyStatus?.connected ? "#16A34A" : "#2E58EC",
                      }}>
                        {calendlyStatus?.connected ? "Connected" : "Not connected"}
                      </span>
                    </div>

                    {/* Apple Calendar — CalDAV via Apple ID + app-specific password */}
                    <div style={{
                      border: appleStatus?.connected ? "1.5px solid rgba(22,163,74,0.4)" : "1.5px solid #2E58EC",
                      borderRadius: "14px", padding: "20px",
                      background: appleStatus?.connected ? "rgba(22,163,74,0.04)" : "rgba(46,88,236,0.04)",
                    }}>
                      <CalendarDays size={26} color={appleStatus?.connected ? "#16A34A" : "#2E58EC"} />
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "12px 0 4px" }}>
                        Apple Calendar
                      </p>
                      <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px", lineHeight: "17px" }}>
                        {appleStatus?.connected
                          ? `Connected as ${appleStatus.username || "your account"}`
                          : "Blocks VenCome dates from your iCloud calendar."}
                      </p>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700",
                        background: appleStatus?.connected ? "rgba(22,163,74,0.12)" : "rgba(46,88,236,0.1)",
                        color: appleStatus?.connected ? "#16A34A" : "#2E58EC",
                      }}>
                        {appleStatus?.connected ? "Connected" : "Not connected"}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px",
                  }}>
                    <div style={{
                      padding: "20px 24px", textAlign: "center",
                      border: "1px solid #F3F4F6", borderRadius: "12px", background: "#FCFCFC",
                    }}>
                      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
                        {googleCalendar?.connected
                          ? googleCalendar.lastSyncedAt
                            ? `Last synced ${new Date(googleCalendar.lastSyncedAt).toLocaleString("en-GB")}`
                            : "Connected — first sync runs within 30 minutes."
                          : "Connect Google Calendar to enable two-way sync across all your listings."}
                      </p>

                      <button
                        type="button"
                        onClick={googleCalendar?.connected ? handleDisconnectCalendar : handleConnectCalendar}
                        disabled={connectingCalendar}
                        style={{
                          padding: "12px 28px", borderRadius: "10px",
                          border: googleCalendar?.connected ? "1.5px solid #DC2626" : "none",
                          background: connectingCalendar ? "#9CA3AF" : googleCalendar?.connected ? "#fff" : "#2E58EC",
                          color: connectingCalendar ? "#fff" : googleCalendar?.connected ? "#DC2626" : "#fff",
                          fontSize: "14px", fontWeight: "600",
                          cursor: connectingCalendar ? "not-allowed" : "pointer",
                          display: "inline-flex", alignItems: "center", gap: "8px",
                        }}
                      >
                        {connectingCalendar && <Loader2 size={14} className="animate-spin" />}
                        {connectingCalendar
                          ? "Redirecting..."
                          : googleCalendar?.connected
                          ? "Disconnect Google"
                          : "Connect Google Calendar"}
                      </button>
                    </div>

                    <div style={{
                      padding: "20px 24px", textAlign: "center",
                      border: "1px solid #F3F4F6", borderRadius: "12px", background: "#FCFCFC",
                    }}>
                      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
                        {outlookCalendar?.connected
                          ? outlookCalendar.lastSyncedAt
                            ? `Last synced ${new Date(outlookCalendar.lastSyncedAt).toLocaleString("en-GB")}`
                            : "Connected — first sync runs within 30 minutes."
                          : "Connect Outlook to enable two-way sync across all your listings."}
                      </p>

                      <button
                        type="button"
                        onClick={outlookCalendar?.connected ? handleDisconnectOutlook : handleConnectOutlook}
                        disabled={connectingOutlook}
                        style={{
                          padding: "12px 28px", borderRadius: "10px",
                          border: outlookCalendar?.connected ? "1.5px solid #DC2626" : "none",
                          background: connectingOutlook ? "#9CA3AF" : outlookCalendar?.connected ? "#fff" : "#2E58EC",
                          color: connectingOutlook ? "#fff" : outlookCalendar?.connected ? "#DC2626" : "#fff",
                          fontSize: "14px", fontWeight: "600",
                          cursor: connectingOutlook ? "not-allowed" : "pointer",
                          display: "inline-flex", alignItems: "center", gap: "8px",
                        }}
                      >
                        {connectingOutlook && <Loader2 size={14} className="animate-spin" />}
                        {connectingOutlook
                          ? "Redirecting..."
                          : outlookCalendar?.connected
                          ? "Disconnect Outlook"
                          : "Connect Outlook"}
                      </button>
                    </div>

                    <div style={{
                      padding: "20px 24px", textAlign: "center",
                      border: "1px solid #F3F4F6", borderRadius: "12px", background: "#FCFCFC",
                    }}>
                      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
                        {calendlyStatus?.connected
                          ? calendlyStatus.lastSyncedAt
                            ? `Last synced ${new Date(calendlyStatus.lastSyncedAt).toLocaleString("en-GB")}`
                            : "Connected — first sync runs within 30 minutes."
                          : "Connect Calendly to block VenCome dates from your existing bookings."}
                      </p>

                      <button
                        type="button"
                        onClick={calendlyStatus?.connected ? handleDisconnectCalendly : handleConnectCalendly}
                        disabled={connectingCalendly}
                        style={{
                          padding: "12px 28px", borderRadius: "10px",
                          border: calendlyStatus?.connected ? "1.5px solid #DC2626" : "none",
                          background: connectingCalendly ? "#9CA3AF" : calendlyStatus?.connected ? "#fff" : "#2E58EC",
                          color: connectingCalendly ? "#fff" : calendlyStatus?.connected ? "#DC2626" : "#fff",
                          fontSize: "14px", fontWeight: "600",
                          cursor: connectingCalendly ? "not-allowed" : "pointer",
                          display: "inline-flex", alignItems: "center", gap: "8px",
                        }}
                      >
                        {connectingCalendly && <Loader2 size={14} className="animate-spin" />}
                        {connectingCalendly
                          ? "Redirecting..."
                          : calendlyStatus?.connected
                          ? "Disconnect Calendly"
                          : "Connect Calendly"}
                      </button>
                    </div>
                  </div>

                  <div style={{
                    marginTop: "14px", padding: "20px 24px",
                    border: "1px solid #F3F4F6", borderRadius: "12px", background: "#FCFCFC",
                  }}>
                    {calcomStatus?.connected ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "13px", color: "#6B7280" }}>
                          {calcomStatus.lastSyncedAt
                            ? `Cal.com last synced ${new Date(calcomStatus.lastSyncedAt).toLocaleString("en-GB")}`
                            : "Cal.com connected — first sync runs within 30 minutes."}
                        </p>
                        <button
                          type="button"
                          onClick={handleDisconnectCalcom}
                          disabled={connectingCalcom}
                          style={{
                            padding: "10px 20px", borderRadius: "10px",
                            border: "1.5px solid #DC2626", background: "#fff", color: "#DC2626",
                            fontSize: "13px", fontWeight: "600",
                            cursor: connectingCalcom ? "not-allowed" : "pointer",
                          }}
                        >
                          Disconnect Cal.com
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px" }}>
                          Paste your Cal.com API key (Cal.com dashboard → Settings → Developer → API Keys) to block VenCome dates from your existing bookings.
                        </p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            value={calcomApiKeyInput}
                            onChange={(e) => setCalcomApiKeyInput(e.target.value)}
                            placeholder="cal_live_..."
                            style={{
                              flex: "1 1 240px", padding: "12px 14px", borderRadius: "10px",
                              border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleConnectCalcom}
                            disabled={connectingCalcom}
                            style={{
                              padding: "12px 24px", borderRadius: "10px", border: "none",
                              background: connectingCalcom ? "#9CA3AF" : "#2E58EC", color: "#fff",
                              fontSize: "14px", fontWeight: "600",
                              cursor: connectingCalcom ? "not-allowed" : "pointer",
                              display: "inline-flex", alignItems: "center", gap: "8px",
                            }}
                          >
                            {connectingCalcom && <Loader2 size={14} className="animate-spin" />}
                            {connectingCalcom ? "Verifying..." : "Connect Cal.com"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{
                    marginTop: "14px", padding: "20px 24px",
                    border: "1px solid #F3F4F6", borderRadius: "12px", background: "#FCFCFC",
                  }}>
                    {appleStatus?.connected ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "13px", color: "#6B7280" }}>
                          {appleStatus.lastSyncedAt
                            ? `Apple Calendar last synced ${new Date(appleStatus.lastSyncedAt).toLocaleString("en-GB")}`
                            : "Apple Calendar connected — first sync runs within 30 minutes."}
                        </p>
                        <button
                          type="button"
                          onClick={handleDisconnectApple}
                          disabled={connectingApple}
                          style={{
                            padding: "10px 20px", borderRadius: "10px",
                            border: "1.5px solid #DC2626", background: "#fff", color: "#DC2626",
                            fontSize: "13px", fontWeight: "600",
                            cursor: connectingApple ? "not-allowed" : "pointer",
                          }}
                        >
                          Disconnect Apple Calendar
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px" }}>
                          Enter your Apple ID and an app-specific password (generate one at appleid.apple.com → Sign-In and Security → App-Specific Passwords) to block VenCome dates from your iCloud calendar.
                        </p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            value={appleUsernameInput}
                            onChange={(e) => setAppleUsernameInput(e.target.value)}
                            placeholder="Apple ID email"
                            style={{
                              flex: "1 1 200px", padding: "12px 14px", borderRadius: "10px",
                              border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none",
                            }}
                          />
                          <input
                            type="password"
                            value={applePasswordInput}
                            onChange={(e) => setApplePasswordInput(e.target.value)}
                            placeholder="App-specific password"
                            style={{
                              flex: "1 1 200px", padding: "12px 14px", borderRadius: "10px",
                              border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleConnectApple}
                            disabled={connectingApple}
                            style={{
                              padding: "12px 24px", borderRadius: "10px", border: "none",
                              background: connectingApple ? "#9CA3AF" : "#2E58EC", color: "#fff",
                              fontSize: "14px", fontWeight: "600",
                              cursor: connectingApple ? "not-allowed" : "pointer",
                              display: "inline-flex", alignItems: "center", gap: "8px",
                            }}
                          >
                            {connectingApple && <Loader2 size={14} className="animate-spin" />}
                            {connectingApple ? "Verifying..." : "Connect Apple Calendar"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "verification" && (
            <div>
              <p style={sectionTitle}>Verification</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <IdentityVerification user={user || {}} />
                <BusinessVerification />
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
