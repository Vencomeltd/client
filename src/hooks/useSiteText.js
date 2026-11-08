import { useRouteLoaderData } from "react-router-dom";
import { SITE_CONTENT_DEFAULTS } from "../content/siteContent";

// t("home.hero.subtitle") -> the published text for that block, or its
// default from src/content/siteContent.js (overrides come from root.jsx's
// loader; a missing or failed fetch just leaves the defaults).
export default function useSiteText() {
  const overrides = useRouteLoaderData("root")?.siteContent || {};
  return (key) => overrides[key] ?? SITE_CONTENT_DEFAULTS[key] ?? "";
}
