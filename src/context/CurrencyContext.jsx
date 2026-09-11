import { createContext, useContext, useEffect, useState } from "react";

// Reads the admin-configured platform currency (PlatformSettings.currency,
// defaults to GBP) so the Navbar's currency picker reflects the real admin
// setting instead of an inert local value. VenCome is UK-only for now, so
// this doesn't drive any price conversion -- it just makes the displayed
// currency honest and ready for whenever admin does change it.
const CurrencyContext = createContext({ currency: "GBP" });

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("GBP");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/platform-settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.currency) setCurrency(data.currency);
      })
      .catch(() => {});
  }, []);

  return <CurrencyContext.Provider value={{ currency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
