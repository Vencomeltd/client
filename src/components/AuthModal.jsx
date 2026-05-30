import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Check, ChevronLeft, Loader2, Search, X } from "lucide-react";

const COLORS = {
  blue: "#2E58EC",
  navy: "#0A1628",
  border: "#E5E7EB",
  grey: "#6B7280",
  error: "#DC2626",
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/");
  return {
    isOpen,
    open: (redirect = "/") => {
      setRedirectTo(redirect);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
    redirectTo,
  };
}

export default function AuthModal({ isOpen, onClose, redirectTo = "/" }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [step, setStep] = useState("role");
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef([]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setStep("role");
    setRole(null);
    setEmail("");
    setEmailError("");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setIsLoading(false);
    setResendTimer(30);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (step === "otp") otpRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const t = window.setTimeout(() => setResendTimer((r) => r - 1), 1000);
      return () => window.clearTimeout(t);
    }
  }, [resendTimer, step]);

  useEffect(() => {
    if (step !== "success") return undefined;
    const t = window.setTimeout(() => {
      onClose();
      navigate(redirectTo);
    }, 4000);
    return () => window.clearTimeout(t);
  }, [navigate, onClose, redirectTo, step]);

  const handleContinue = () => {
    if (!role) {
      setEmailError("Please select an account type");
      return;
    }
    if (!email || !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setOtpError("");
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      setResendTimer(30);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      if (code === "123456") {
        setStep("success");
        return;
      }
      setOtpError("Incorrect code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }, 1500);
  };

  const cardStyle = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: "20px 20px 0 0",
        maxHeight: "95vh",
        overflowY: "auto",
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        borderRadius: 20,
        maxHeight: "90vh",
        overflowY: "auto",
      };

  const motionProps = isMobile
    ? {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", stiffness: 260, damping: 28 },
      }
    : {
        initial: { opacity: 0, scale: 0.96, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 20 },
        transition: { duration: 0.25, ease: "easeOut" },
      };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              zIndex: 1000,
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            {...motionProps}
            style={{
              ...cardStyle,
              width: isMobile ? "100vw" : "90vw",
              maxWidth: isMobile ? "none" : 480,
              background: "white",
              padding: 32,
              zIndex: 1001,
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `1px solid ${COLORS.border}`,
                background: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color="#111827" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === "role" ? (
                  <div>
                    <img
                      src="/logo-blue.png"
                      alt="VenCome"
                      style={{ height: 36, margin: "0 auto 24px", display: "block" }}
                    />
                    <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, textAlign: "center", marginBottom: 6 }}>
                      Log in or sign up
                    </div>
                    <div style={{ fontSize: 14, color: COLORS.grey, textAlign: "center", marginBottom: 28 }}>
                      Welcome to VenCome
                    </div>

                    <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                      {[
                        { id: "customer", Icon: Search, title: "Find a Space", desc: "Book commercial spaces for your business" },
                        { id: "host", Icon: Building2, title: "List a Space", desc: "Earn by renting out your commercial property" },
                      ].map((option) => {
                        const RoleIcon = option.Icon;
                        return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setRole(option.id)}
                          style={{
                            flex: 1,
                            padding: "18px 12px",
                            borderRadius: 14,
                            border: "2px solid",
                            borderColor: role === option.id ? COLORS.blue : COLORS.border,
                            background: role === option.id ? "rgba(46,88,236,0.04)" : "white",
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "all 0.15s ease",
                            fontFamily: "inherit",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                            <RoleIcon size={24} color="#2E58EC" />
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>{option.title}</div>
                          <div style={{ fontSize: 12, color: COLORS.grey, lineHeight: 1.4 }}>{option.desc}</div>
                        </button>
                        );
                      })}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: "100%",
                          height: 52,
                          border: "1.5px solid",
                          borderColor: emailError ? COLORS.error : COLORS.border,
                          borderRadius: 10,
                          padding: "0 16px",
                          fontSize: 15,
                          color: "#111827",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = COLORS.blue)}
                        onBlur={(e) => (e.target.style.borderColor = emailError ? COLORS.error : COLORS.border)}
                      />
                      {emailError ? <p style={{ fontSize: 12, color: COLORS.error, marginTop: 6 }}>{emailError}</p> : null}
                    </div>

                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        height: 52,
                        background: COLORS.blue,
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontFamily: "inherit",
                      }}
                    >
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ display: "flex" }}>
                          <Loader2 size={20} />
                        </motion.div>
                      ) : (
                        "Continue"
                      )}
                    </button>
                  </div>
                ) : null}

                {step === "otp" ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("role");
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

                    <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, textAlign: "center", marginBottom: 8 }}>Check your email</div>
                    <div style={{ fontSize: 14, color: COLORS.grey, textAlign: "center" }}>We sent a 6-digit code to</div>
                    <div style={{ fontSize: 14, color: COLORS.navy, fontWeight: 700, textAlign: "center", marginTop: 6 }}>{email}</div>

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
                            if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
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

                    {otpError ? <p style={{ fontSize: 13, color: COLORS.error, textAlign: "center", marginBottom: 16 }}>{otpError}</p> : null}

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.join("").length < 6}
                      style={{
                        width: "100%",
                        height: 52,
                        background: COLORS.blue,
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: isLoading || otp.join("").length < 6 ? "not-allowed" : "pointer",
                        opacity: isLoading || otp.join("").length < 6 ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontFamily: "inherit",
                      }}
                    >
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ display: "flex" }}>
                          <Loader2 size={20} />
                        </motion.div>
                      ) : (
                        "Verify"
                      )}
                    </button>

                    <p style={{ fontSize: 13, color: COLORS.grey, textAlign: "center", marginTop: 16 }}>
                      Didn't receive it?{" "}
                      {resendTimer > 0 ? (
                        <span style={{ color: COLORS.grey }}>Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setResendTimer(30)}
                          style={{
                            color: COLORS.blue,
                            fontWeight: 600,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Resend code
                        </button>
                      )}
                    </p>
                  </div>
                ) : null}

                {step === "success" ? (
                  <div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: COLORS.navy,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                      }}
                    >
                      <Check size={36} color="white" />
                    </motion.div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.navy, textAlign: "center" }}>You're in!</div>
                    <div style={{ fontSize: 15, color: COLORS.grey, textAlign: "center", marginTop: 6, marginBottom: 20 }}>Welcome to VenCome.</div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(redirectTo);
                      }}
                      style={{
                        width: "100%",
                        height: 52,
                        background: COLORS.blue,
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Continue
                    </button>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
