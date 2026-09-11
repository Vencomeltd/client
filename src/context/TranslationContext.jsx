import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translatePage } from "../utils/translation";

export const LANGUAGES = [
  { code: "en-US", label: "English", region: "United States" },
  { code: "en-GB", label: "English", region: "United Kingdom" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
];

const STORAGE_KEY = "vencome_language";
const TranslationContext = createContext(null);

export function TranslationProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) || "en-GB"
  );

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  useEffect(() => {
    // Google Translate uses two-letter codes; en-US/en-GB both mean "leave
    // the page alone" since the site's source text is already English.
    const target = language.startsWith("en") ? "en" : language;
    translatePage(target, import.meta.env.VITE_API_URL);

    if (target === "en") return undefined;

    // React re-renders (route changes, data loading in) create new text
    // nodes the initial pass never saw -- re-translate after the DOM
    // settles down. Guarded to converge: translatePage only writes nodes
    // whose value actually changes, so an already-translated page makes no
    // further writes and the observer goes quiet on its own.
    let debounceTimer;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        translatePage(target, import.meta.env.VITE_API_URL);
      }, 400);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, languages: LANGUAGES }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within a TranslationProvider");
  return ctx;
}
