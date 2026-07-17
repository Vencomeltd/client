import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// The screen a user lands on from their "VenCome Support is requesting
// access" email — a plain Grant/Deny choice, not a login page. The token in
// the URL is the credential (long, random, single-purpose, emailed only to
// the account owner), so no separate sign-in step is needed here.
export default function SupportAccessGrantScreen() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/support-access/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "This link isn't valid.");
        setRequest(data);
      } catch (err) {
        setError(err.message || "This link isn't valid.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const respond = async (action) => {
    setResponding(true);
    try {
      const res = await fetch(`${API_URL}/support-access/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data.status);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(48,92,222,0.1)]">
          <ShieldCheck size={22} className="text-[#2E58EC]" />
        </div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#2E58EC]">
          VenCome Support
        </p>

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[#6B7280]">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {!loading && error && !result && (
          <p className="mt-4 text-[14px] text-[#DC2626]">{error}</p>
        )}

        {!loading && !error && request && request.status === "pending" && !result && (
          <>
            <h1 className="mt-4 text-[18px] font-bold text-[#0A1628]">
              Access request
            </h1>
            <p className="mt-3 text-[14px] leading-6 text-[#6B7280]">
              <strong className="text-[#0A1628]">{request.adminName}</strong> from VenCome
              Support would like to view your account to help with:
            </p>
            <p className="mt-2 rounded-lg bg-[#F8F6F0] px-4 py-3 text-[14px] font-medium text-[#0A1628]">
              {request.reason || "a support request"}
            </p>
            <p className="mt-3 text-[12px] text-[#9CA3AF]">
              If granted, access lasts 1 hour and you can see exactly what happened afterward. You can decline — nothing changes if you do.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={responding}
                onClick={() => respond("deny")}
                className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#0A1628] transition hover:bg-[#F8F6F0] disabled:opacity-50"
              >
                Deny
              </button>
              <button
                type="button"
                disabled={responding}
                onClick={() => respond("grant")}
                className="flex-1 rounded-lg bg-[#2E58EC] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#254FC7] disabled:opacity-50"
              >
                {responding ? "Please wait…" : "Grant Access"}
              </button>
            </div>
          </>
        )}

        {!loading && request && request.status !== "pending" && !result && (
          <p className="mt-4 text-[14px] text-[#6B7280]">
            This request was already {request.status}.
          </p>
        )}

        {result === "granted" && (
          <p className="mt-4 text-[14px] text-[#16A34A] font-medium">
            Access granted. VenCome Support can now view your account for the next hour.
          </p>
        )}
        {result === "denied" && (
          <p className="mt-4 text-[14px] text-[#0A1628] font-medium">
            Request denied. VenCome Support has been notified.
          </p>
        )}
      </div>
    </div>
  );
}
