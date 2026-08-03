import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import OTPInput from "../components/OTPInput";
import { apiFetch } from "../utils/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const onBackToLogin = () => navigate("/login");
  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBackToCredentials = () => {
    setStep(1);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setResendMessage("");
    try {
      await apiFetch({
        endpoint: "/auth/forgot-password",
        method: "POST",
        body: { email },
      });
      setResendMessage("A new code has been sent.");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch({
        endpoint: "/auth/forgot-password",
        method: "POST",
        body: { email },
      });
      setStep(2);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    try {
      const data = await apiFetch({
        endpoint: "/auth/verify-otp",
        method: "POST",
        body: { email, otp },
      });
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      throw err;
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch({
        endpoint: "/auth/reset-password",
        method: "POST",
        body: { resetToken, password, confirmPassword },
      });
      onBackToLogin();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Forgot Password
          </h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleEmailSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
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
                  Sending...
                </span>
              ) : (
                "Send OTP"
              )}
            </Button>
            <p
              className="mt-4 text-primary cursor-pointer text-center"
              onClick={onBackToLogin}
            >
              Back to Login
            </p>
          </form>
        </>
      )}
      {step === 2 && (
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
          <OTPInput email={email} onVerify={handleOTPVerify} />
          {resendMessage && (
            <p className="text-green-600 text-sm text-center mt-2">{resendMessage}</p>
          )}
          <div className="flex items-center justify-between text-sm mt-6">
            <button
              type="button"
              onClick={handleBackToCredentials}
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
      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Reset Password
          </h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handlePasswordReset}>
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
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
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
            <p
              className="mt-4 text-primary cursor-pointer text-center"
              onClick={onBackToLogin}
            >
              Back to Login
            </p>
          </form>
        </>
      )}{" "}
    </div>
  );
};

export default ForgotPassword;
