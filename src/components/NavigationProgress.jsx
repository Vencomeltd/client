import { useEffect, useState } from "react";
import { useNavigation } from "react-router";

// Thin bar along the top while a page navigation is loading, so a click
// gives instant feedback instead of the old page looking frozen until the
// next page's data arrives. Styles: .vc-nav-progress in index.css.
export default function NavigationProgress() {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!busy) {
      setVisible(false);
      return;
    }
    // Don't flash on navigations that finish almost instantly.
    const timer = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(timer);
  }, [busy]);

  if (!visible) return null;
  return <div role="progressbar" aria-label="Loading page" className="vc-nav-progress" />;
}
