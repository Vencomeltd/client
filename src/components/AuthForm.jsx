import React, { useState, useEffect } from "react";
import Input from "./Input";
import Button from "./Button";
import OTPInput from "./OTPInput";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Check, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomToast from "./CustomToast";
import { useAuth } from "../context/AuthContext";

const AuthForm = ({ onForgotPassword, onSuccess }) => {
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [step, setStep] = useState("credentials");
  const navigate = useNavigate();
  const { login, signup, verifyOtp, googleLogin } = useAuth();

  const calculateStrength = (pass) => {
    const checks = [
      { regex: /.{8,}/, label: "At least 8 characters" },
      { regex: /[A-Z]/, label: "One uppercase letter" },
      { regex: /[a-z]/, label: "One lowercase letter" },
      { regex: /[0-9]/, label: "One number" },
      { regex: /[^A-Za-z0-9]/, label: "One symbol" },
    ];
    const score = checks.reduce(
      (acc, check) => acc + (check.regex.test(pass) ? 20 : 0),
      0
    );
    return { score, checks };
  };

  const { score, checks } = calculateStrength(password);
  const strengthColor =
    score < 40 ? "bg-red-500" : score < 70 ? "bg-yellow-500" : "bg-green-500";
  const strengthText = score < 40 ? "Weak" : score < 70 ? "Medium" : "Strong";

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? "Invalid email address" : "";
  };

  const validatePassword = (value) => {
    return value.length < 8 ? "Password must be at least 8 characters" : "";
  };

  useEffect(() => {
    if (touched.email)
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    if (touched.password)
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  }, [email, password, touched]);

  const isFormValid = () => {
    const base = email && password && !errors.email && !errors.password;
    return isLogin ? base : base && score === 100;
  };

  useEffect(() => {
    if (isLogin) {
      const remembered = localStorage.getItem("rememberedEmail");
      if (remembered) {
        setEmail(remembered);
        setRememberMe(true);
      }
    }
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({
      email: validateEmail(email),
      password: validatePassword(password),
    });
    setTouched({ email: true, password: true });

    if (!isFormValid()) {
      toast.error(<CustomToast message="Please fix the errors below" />, {
        className: "custom-toast-error",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await (isLogin
        ? login(email, password)
        : signup(email, password));

      if (data.requiresVerification) {
        setStep("otp");
        toast.success(
          <CustomToast
            message={`OTP sent to ${email}. Please check your inbox.`}
          />,
          { className: "custom-toast-success" }
        );
      }
    } catch (err) {
      toast.error(
        <CustomToast
          message={err.message || (isLogin ? "Login failed" : "Signup failed")}
        />
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    await verifyOtp(email, otpValue);

    if (isLogin) {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    }

    toast.success(
      <CustomToast
        message={
          isLogin ? "Login successful!" : "Account created successfully!"
        }
      />,
      { className: "custom-toast-success" }
    );

    setTimeout(() => {
      onSuccess();
      navigate("/", { replace: true });
    }, 2000);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await (isLogin ? login(email, password) : signup(email, password));
      toast.success(<CustomToast message="OTP resent successfully!" />, {
        className: "custom-toast-success",
      });
    } catch (err) {
      toast.error(
        <CustomToast message={err.message || "Failed to resend OTP"} />
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      onSuccess();
      navigate("/");
    } catch (err) {
      toast.error(
        <CustomToast message={err.message || "Google login failed"} />
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="w-full text-black max-w-md mx-auto">
        {step === "credentials" ? (
          <>
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
              {isLogin ? (
                <>
                  Welcome back <br /> to VenCome
                </>
              ) : (
                "Welcome to VenCome"
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                  placeholder="you@example.com"
                  required
                  error={touched.email && errors.email}
                  shake={touched.email && !!errors.email}
                />
              </div>

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, password: true }))
                  }
                  placeholder="••••••••"
                  required
                  error={touched.password && errors.password}
                  shake={touched.password && !!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

                {!isLogin && password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Password Strength:</span>
                      <span
                        className={`font-bold ${
                          score < 40
                            ? "text-red-600"
                            : score < 70
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {strengthText}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} transition-all duration-500 ease-out`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 space-y-1 mt-2 border-l-4 border-gray-300 pl-3">
                      {checks.map((check, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 transition-all ${
                            check.regex.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <span>
                            {check.regex.test(password) ? (
                              <Check size={14} />
                            ) : (
                              <X size={14} />
                            )}
                          </span>
                          <span>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`w-full font-medium transition-all ${
                  isFormValid() && !loading
                    ? "bg-primary hover:bg-primary text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing...
                  </span>
                ) : isLogin ? (
                  "Continue"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center mt-6">
              {isLogin ? (
                <>
                  Not registered yet?{" "}
                  <Link to="/signup" className="text-primary">
                    Sign Up today!
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary">
                    Login!
                  </Link>
                </>
              )}
            </p>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <GoogleLogin
                auto_select={isLogin}
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  toast.error(<CustomToast message="Google login failed" />)
                }
                theme="outline"
                size="large"
                width="100%"
              />
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600 mb-4">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                The code will expire in 10 minutes
              </p>
            </div>

            <OTPInput email={email} onVerify={handleVerifyOTP} />

            <div className="flex items-center justify-between text-sm mt-6">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                ← Change email
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-primary hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AuthForm;
