import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Building2, Check, ChevronLeft, Loader2, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

const API = import.meta.env.VITE_API_URL;

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
  "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
  "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&q=80",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80",
  "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&q=80",
];

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPage({ mode = "login" }) {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [step, setStep] = useState("role");
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (step === "otp") {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (step === "otp" && resendTimer > 0) {
      const t = window.setTimeout(() => setResendTimer((r) => r - 1), 1000);
      return () => window.clearTimeout(t);
    }
  }, [resendTimer, step]);

  const handleContinue = async () => {
    if (!role) {
      setEmailError("Please select an account type");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setIsLoading(true);

    try {
      const checkRes = await fetch(`${API}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (checkRes.ok) {
        setStep("otp");
        setResendTimer(30);
      } else {
        const signupRes = await fetch(`${API}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: `Vc_${Math.random().toString(36).slice(2)}!A1`,
            isHost: role === "host",
          }),
        });
        const signupData = await signupRes.json();

        if (!signupRes.ok && signupRes.status !== 409) {
          setEmailError(signupData.error || "Something went wrong");
          setIsLoading(false);
          return;
        }

        await fetch(`${API}/auth/resend-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        setStep("otp");
        setResendTimer(30);
      }
    } catch (err) {
      setEmailError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setIsLoading(true);
    setOtpError("");

    try {
      const res = await fetch(`${API}/auth/verify-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || "Invalid or expired code");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        setIsLoading(false);
        return;
      }

      let resolvedUser = data.user;
      localStorage.setItem("vencome_token", data.token);
      localStorage.setItem("vencome_refresh", data.refreshToken);
      localStorage.setItem("vencome_user", JSON.stringify(resolvedUser));
      localStorage.setItem("vencome_login_time", Date.now().toString());
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(resolvedUser));

      if (role === "host" && !resolvedUser.isHost) {
        const roleRes = await fetch(`${API}/auth/update-role`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ isHost: true }),
        });

        if (roleRes.ok) {
          resolvedUser = { ...resolvedUser, isHost: true };
          localStorage.setItem("vencome_user", JSON.stringify(resolvedUser));
          localStorage.setItem("user", JSON.stringify(resolvedUser));
        }
      }

      updateUser(resolvedUser);
      setFirstName(resolvedUser.firstName || email.split("@")[0]);
      setStep("success");
      const userIsHost = resolvedUser?.isHost === true || role === "host";

      window.setTimeout(() => {
        if (userIsHost) {
          navigate("/dashboard");
        } else {
          navigate("/customer/dashboard");
        }
      }, 1500);
    } catch (err) {
      setOtpError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(30);
    try {
      await fetch(`${API}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("Resend failed", err);
    }
  };

  const title = mode === "signup" ? "Create your account" : "Log in or sign up";
  const googleButtonWidth = Math.min(
    400,
    Math.max(220, window.innerWidth - (isMobile ? 88 : 128))
  );
  const roleOptions =
    mode === "signup"
      ? [
          {
            id: "customer",
            Icon: Search,
            title: "I want to find spaces",
            desc: "Book commercial spaces for your business",
          },
          {
            id: "host",
            Icon: Building2,
            title: "I want to list spaces",
            desc: "Earn by renting out your commercial property",
          },
        ]
      : [
          {
            id: "customer",
            Icon: Search,
            title: "Find a Space",
            desc: "Book commercial spaces for your business",
          },
          {
            id: "host",
            Icon: Building2,
            title: "List a Space",
            desc: "Earn by renting out your commercial property",
          },
        ];

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
            borderRadius: isMobile ? 18 : 20,
            width: "100%",
            maxWidth: 480,
            padding: isMobile ? 24 : 40,
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
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
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: COLORS.navy,
                      textAlign: "center",
                      marginBottom: 6,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: COLORS.grey,
                      textAlign: "center",
                      marginBottom: 28,
                    }}
                  >
                    Welcome to VenCome
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    {roleOptions.map((option) => {
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
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: COLORS.navy,
                            marginBottom: 4,
                          }}
                        >
                          {option.title}
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.grey, lineHeight: 1.4 }}>
                          {option.desc}
                        </div>
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
                        color: COLORS.navy,
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = COLORS.blue)}
                      onBlur={(e) =>
                        (e.target.style.borderColor = emailError ? COLORS.error : COLORS.border)
                      }
                    />
                    {emailError ? (
                      <p style={{ fontSize: 12, color: COLORS.error, marginTop: 6 }}>
                        {emailError}
                      </p>
                    ) : null}
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
                      marginBottom: 20,
                      fontFamily: "inherit",
                    }}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        style={{ display: "flex" }}
                      >
                        <Loader2 size={20} />
                      </motion.div>
                    ) : (
                      "Continue"
                    )}
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: COLORS.border }} />
                    <span style={{ fontSize: 13, color: COLORS.grey }}>or</span>
                    <div style={{ flex: 1, height: 1, background: COLORS.border }} />
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        overflow: "hidden",
                        borderRadius: 10,
                      }}
                    >
                      <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                          setIsLoading(true);
                          setEmailError("");
                          try {
                            const res = await fetch(`${API}/auth/google`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                token: credentialResponse.credential,
                                role,
                                isHost: role === "host",
                              }),
                            });
                            const data = await res.json();

                            if (!res.ok) {
                              setEmailError(data.error || "Google sign in failed");
                              setIsLoading(false);
                              return;
                            }

                            let resolvedUser = data.user;
                            localStorage.setItem("vencome_token", data.token);
                            localStorage.setItem("vencome_refresh", data.refreshToken);
                            localStorage.setItem("vencome_user", JSON.stringify(resolvedUser));
                            localStorage.setItem("vencome_login_time", Date.now().toString());
                            localStorage.setItem("token", data.token);
                            localStorage.setItem("refreshToken", data.refreshToken);
                            localStorage.setItem("user", JSON.stringify(resolvedUser));

                            if (role === "host" && !resolvedUser.isHost) {
                              try {
                                await fetch(`${API}/auth/update-role`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${data.token}`,
                                  },
                                  body: JSON.stringify({ isHost: true }),
                                });
                                resolvedUser = { ...resolvedUser, isHost: true };
                                localStorage.setItem("vencome_user", JSON.stringify(resolvedUser));
                                localStorage.setItem("user", JSON.stringify(resolvedUser));
                              } catch (err) {
                                console.error("Role update failed", err);
                              }
                            }

                            updateUser(resolvedUser);
                            setFirstName(resolvedUser.firstName || "");
                            setStep("success");
                            const userIsHost = resolvedUser?.isHost === true || role === "host";

                            window.setTimeout(() => {
                              if (userIsHost) {
                                navigate("/dashboard");
                              } else {
                                navigate("/customer/dashboard");
                              }
                            }, 1500);
                          } catch (err) {
                            setEmailError("Google sign in failed. Try again.");
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        onError={() => setEmailError("Google sign in failed")}
                        useOneTap={false}
                        theme="outline"
                        size="large"
                        width={String(googleButtonWidth)}
                        text="continue_with"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      width: "100%",
                      height: 52,
                      border: `1.5px solid ${COLORS.border}`,
                      borderRadius: 10,
                      background: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#0A66C2",
                      fontFamily: "inherit",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Continue with LinkedIn
                  </button>

                  <p
                    style={{
                      fontSize: 12,
                      color: COLORS.grey,
                      textAlign: "center",
                      marginTop: 20,
                      lineHeight: 1.5,
                    }}
                  >
                    By continuing, you agree to VenCome's{" "}
                    <Link to="/terms" style={{ color: COLORS.blue, textDecoration: "none" }}>
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" style={{ color: COLORS.blue, textDecoration: "none" }}>
                      Privacy Policy
                    </Link>
                  </p>
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

                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: COLORS.navy,
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    Check your email
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.grey, textAlign: "center" }}>
                    We sent a 6-digit code to
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: COLORS.navy,
                      fontWeight: 700,
                      textAlign: "center",
                      marginTop: 6,
                    }}
                  >
                    {email}
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
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        style={{ display: "flex" }}
                      >
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
                        onClick={handleResend}
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
                  <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.navy, textAlign: "center" }}>
                    You're in!
                  </div>
                  <div style={{ fontSize: 15, color: COLORS.grey, textAlign: "center", marginTop: 6, marginBottom: 20 }}>
                    Welcome to VenCome{firstName ? `, ${firstName}` : ""}.
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(role === "host" ? "/dashboard" : "/search")}
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontFamily: "inherit",
                      marginBottom: 10,
                    }}
                  >
                    <Search size={18} />
                    {role === "host" ? "Go to Host Dashboard" : "Start Finding Spaces"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    style={{
                      width: "100%",
                      height: 52,
                      background: "white",
                      color: COLORS.navy,
                      border: `1.5px solid ${COLORS.border}`,
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Explore Homepage
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
