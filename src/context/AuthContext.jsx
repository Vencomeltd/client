import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiFetch } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to store tokens
  const setAuthData = ({ token, refreshToken }) => {
    if (token) localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  // Logout
  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // Listen for forced logout events
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  // Restore session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser)); // optimistic restore

      try {
        const freshUser = await apiFetch({
          endpoint: "/auth/me",
          showErrorToast: false,
        });
        const resolvedUser = freshUser;
        setUser(resolvedUser);
        localStorage.setItem("user", JSON.stringify(resolvedUser));
      } catch {
        logout(); // fallback if token invalid or refresh failed
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [logout]);

  // Email/password login
  const login = async (email, password) => {
    const data = await apiFetch({
      endpoint: "/auth/login",
      method: "POST",
      body: { email, password },
    });
    return data; // { requiresVerification: true }
  };

  // Signup
  const signup = async (email, password) => {
    const data = await apiFetch({
      endpoint: "/auth/signup",
      method: "POST",
      body: { email, password },
    });
    return data;
  };

  // OTP verification
  const verifyOtp = async (email, otp) => {
    const data = await apiFetch({
      endpoint: "/auth/verify-login",
      method: "POST",
      body: { email, otp },
    });

    if (data?.token) {
      setAuthData(data);
      const freshUser = await apiFetch({ endpoint: "/auth/me" });
      const resolvedUser = freshUser;
      setUser(resolvedUser);
      localStorage.setItem("user", JSON.stringify(resolvedUser));
    }

    return data;
  };

  // Google login
  const googleLogin = async (token) => {
    const data = await apiFetch({
      endpoint: "/auth/google",
      method: "POST",
      body: { token },
    });

    if (data?.token) {
      setAuthData(data);
      const freshUser = await apiFetch({ endpoint: "/auth/me" });
      const resolvedUser = freshUser;
      setUser(resolvedUser);
      localStorage.setItem("user", JSON.stringify(resolvedUser));
    }

    return data;
  };

  // Update local user state
  const updateUser = (updatedUser) => {
    const resolvedUser = updatedUser;
    setUser(resolvedUser);
    localStorage.setItem("user", JSON.stringify(resolvedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        verifyOtp,
        googleLogin,
        logout,
        updateUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
