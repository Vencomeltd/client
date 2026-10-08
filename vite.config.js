import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  // reactRouter() subsumes @vitejs/plugin-react (handles the React
  // transform itself) and adds SSR/framework-mode build support.
  plugins: [reactRouter(), tailwindcss()],
  // react-router's own package.json has no "production" condition on its
  // "./dom" subpath export -- every condition points at
  // dist/development/dom-export.js (dist/production/dom-export.js exists
  // but nothing in the exports map ever selects it). Left external, that
  // file has to be present in the deployed function's node_modules at
  // runtime; Vercel's build tracer drops it (its path looks dev-only),
  // which took the whole site down with "Cannot find module
  // '.../react-router/dist/development/dom-export.js'" on every route.
  // Bundling react-router/react-router-dom into the SSR output instead
  // means that file is inlined at build time, so nothing needs tracing it
  // into node_modules at all.
  ssr: { noExternal: ["react-router", "react-router/dom", "react-router-dom"] },
});
