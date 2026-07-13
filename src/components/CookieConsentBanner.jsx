import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "vencome_cookie_consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) setVisible(true);
  }, []);

  const respond = (choice) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, at: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0A1628] text-white px-4 sm:px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-200 max-w-2xl">
          We use cookies to run VenCome and to understand how the site is used.
          Some are essential and always on; others help us improve search and
          booking. Read our{" "}
          <Link to="/privacy" className="underline text-[#C9A84C] hover:text-white">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => respond("necessary_only")}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition"
          >
            Necessary Only
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#C9A84C] text-[#0A1628] hover:opacity-90 transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
