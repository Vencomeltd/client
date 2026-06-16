import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid admin credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("vencome_token", data.token);
      localStorage.setItem("vencome_user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0A1628",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "40px",
        width: "100%", maxWidth: "400px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "rgba(46,88,236,0.1)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <ShieldCheck size={28} color="#2E58EC" />
          </div>
        </div>

        <h1 style={{
          fontSize: "22px", fontWeight: "800", color: "#0A1628",
          textAlign: "center", margin: "0 0 6px",
        }}>
          Admin Access
        </h1>
        <p style={{
          fontSize: "14px", color: "#6B7280", textAlign: "center",
          margin: "0 0 28px",
        }}>
          Restricted area. Authorized personnel only.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#0A1628", display: "block", marginBottom: "8px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%", height: "48px", padding: "0 14px",
                borderRadius: "10px", border: "1.5px solid #E5E7EB",
                fontSize: "15px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#0A1628", display: "block", marginBottom: "8px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%", height: "48px", padding: "0 14px",
                borderRadius: "10px", border: "1.5px solid #E5E7EB",
                fontSize: "15px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#EF4444", fontSize: "13px", margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", height: "48px", borderRadius: "10px",
              border: "none", background: loading ? "#9CA3AF" : "#0A1628",
              color: "#fff", fontSize: "15px", fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", marginTop: "8px",
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
