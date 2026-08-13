import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  // reactRouter() subsumes @vitejs/plugin-react (handles the React
  // transform itself) and adds SSR/framework-mode build support.
  plugins: [reactRouter(), tailwindcss()],
});
