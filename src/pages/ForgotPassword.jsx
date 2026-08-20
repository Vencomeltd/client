import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Loader2 } from "lucide-react";
import { apiFetch } from "../utils/api";
import { BG_IMAGES } from "./AuthPage";

const COLORS = {
  blue: "#2E58EC",
  navy: "#0A1628",
  white: "#FFFFFF",
  bg: "#F8F6F0",
  border: "#E5E7EB",
  grey: "#6B7280",
  error: "#DC2626",
  success: "#16A34A",
};

const inputStyle = (hasError) => ({
  width: "100%",
  height: 52,
  border: "1.5px solid",
  borderColor: hasError ? COLORS.error : COLORS.border,
  borderRadius: 10,
  padding: "0 16px",
  fontSize: 15,
  color: COLORS.navy,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
});

const primaryButtonStyle = (disabled) => ({
  width: "100%",
  height: 52,
  background: COLORS.blue,
  color: "white",
  border: "none",
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.7 : 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: "inherit",
});

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      style={{ display: "flex" }}
    >
      <Loader2 size={20} />
    </motion.div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleEmailSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      await apiFetch({ endpoint: "/auth/forgot-password", method: "POST", body: { email } });
      setStep(2);
    } catch (err) {
      setEmailError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setResendMessage("");
    try {
      await apiFetch({ endpoint: "/auth/forgot-password", method: "POST", body: { email } });
      setResendMessage("A new code has been sent.");
    } catch (err) {
      setOtpError(err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setOtpError("");
    setLoading(true);
    try {
      const data = await apiFetch({
        endpoint: "/auth/verify-otp",
        method: "POST",
        body: { email, otp: code },
      });
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      setOtpError(err.message || "Invalid or expired code");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    setLoading(true);
    try {
      await apiFetch({
        endpoint: "/auth/reset-password",
        method: "POST",
        body: { resetToken, password, confirmPassword },
      });
      navigate("/login");
    } catch (err) {
      setPasswordError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {BG_IMAGES.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            style={{ width: "100%", height: "33vh", objectFit: "cover" }}
          />
        ))}
      </div>

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 16,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 20,
            width: "100%",
            maxWidth: 420,
            padding: 40,
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src="/logo-blue.png"
            alt="VenCome"
            style={{ height: 32, margin: "0 auto 24px", display: "block" }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 ? (
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, textAlign: "center", marginBottom: 6 }}>
                    Forgot your password?
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.grey, textAlign: "center", marginBottom: 28 }}>
                    Enter your email and we'll send you a code to reset it
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle(!!emailError)}
                      onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                    />
                    {emailError ? (
                      <p style={{ fontSize: 12, color: COLORS.error, marginTop: 6 }}>{emailError}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={handleEmailSubmit}
                    disabled={loading}
                    style={{ ...primaryButtonStyle(loading), marginBottom: 20 }}
                  >
                    {loading ? <Spinner /> : "Send Code"}
                  </button>

                  <p style={{ fontSize: 13, color: COLORS.grey, textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: COLORS.blue, fontWeight: 600, fontFamily: "inherit" }}
                    >
                      Back to Login
                    </button>
                  </p>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtpError("");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: "inherit",
                      color: COLORS.navy,
                      fontWeight: 600,
                      marginBottom: 18,
                    }}
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>

                  <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, textAlign: "center", marginBottom: 8 }}>
                    Check your email
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.grey, textAlign: "center" }}>
                    We sent a 6-digit code to
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.navy, fontWeight: 700, textAlign: "center", marginTop: 6, marginBottom: 8 }}>
                    {email}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.grey, textAlign: "center" }}>
                    The code expires in 10 minutes. Can't find it? Check your spam folder.
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "24px 0" }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        maxLength={1}
                        value={otp[i]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          const next = [...otp];
                          next[i] = val;
                          setOtp(next);
                          setOtpError("");
                          if (val && i < 5) otpRefs.current[i + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            otpRefs.current[i - 1]?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
                          const filled = paste.split("").concat(Array(6).fill("")).slice(0, 6);
                          setOtp(filled);
                          setOtpError("");
                          otpRefs.current[Math.min(paste.length, 5)]?.focus();
                        }}
                        style={{
                          width: 48,
                          height: 58,
                          borderRadius: 10,
                          border: "1.5px solid",
                          borderColor: otpError ? COLORS.error : otp[i] ? COLORS.blue : COLORS.border,
                          fontSize: 24,
                          fontWeight: 700,
                          textAlign: "center",
                          color: COLORS.navy,
                          outline: "none",
                          background: "white",
                          fontFamily: "inherit",
                        }}
                      />
                    ))}
                  </div>

                  {otpError ? (
                    <p style={{ fontSize: 13, color: COLORS.error, textAlign: "center", marginBottom: 16 }}>
                      {otpError}
                    </p>
                  ) : null}
                  {resendMessage ? (
                    <p style={{ fontSize: 13, color: COLORS.success, textAlign: "center", marginBottom: 16 }}>
                      {resendMessage}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.join("").length < 6}
                    style={{ ...primaryButtonStyle(loading || otp.join("").length < 6), marginBottom: 16 }}
                  >
                    {loading ? <Spinner /> : "Verify Code"}
                  </button>

                  <p style={{ fontSize: 13, color: COLORS.grey, textAlign: "center" }}>
                    Didn't receive it?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: COLORS.blue, fontWeight: 600, fontFamily: "inherit" }}
                    >
                      Resend code
                    </button>
                  </p>
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, textAlign: "center", marginBottom: 6 }}>
                    Set a new password
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.grey, textAlign: "center", marginBottom: 28 }}>
                    Choose a password with at least 8 characters
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <input
                      type="password"
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={inputStyle(!!passwordError)}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={inputStyle(!!passwordError)}
                      onKeyDown={(e) => e.key === "Enter" && handlePasswordReset()}
                    />
                    {passwordError ? (
                      <p style={{ fontSize: 12, color: COLORS.error, marginTop: 6 }}>{passwordError}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={loading}
                    style={primaryButtonStyle(loading)}
                  >
                    {loading ? <Spinner /> : "Reset Password"}
                  </button>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
