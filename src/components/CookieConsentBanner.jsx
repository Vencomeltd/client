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
    <div className="fixed bottom-4 left-4 right-4 z-[9999] sm:left-6 sm:right-6 lg:left-auto lg:max-w-xl">
      <div
        className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-[#2E58EC]/20 bg-white/80 px-5 py-4 text-[#0A1628] shadow-[0_8px_32px_rgba(10,22,40,0.15)] backdrop-blur-xl backdrop-saturate-150"
      >
        <p className="text-sm text-gray-600">
          We use cookies to run VenCome and to understand how the site is used.
          Some are essential and always on; others help us improve search and
          booking. Read our{" "}
          <Link to="/privacy" className="underline text-[#2E58EC] hover:text-[#0A1628]">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => respond("necessary_only")}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-[#0A1628]/15 bg-black/[0.02] text-[#0A1628] hover:bg-black/[0.06] transition backdrop-blur-sm"
          >
            Necessary Only
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#2E58EC] text-white hover:opacity-90 transition shadow-[0_0_16px_rgba(46,88,236,0.35)]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
