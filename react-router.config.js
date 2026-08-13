import { vercelPreset } from "@vercel/react-router/vite";

/** @type {import("@react-router/dev/config").Config} */
export default {
  // Keep the existing src/ layout instead of moving 50+ page files into a
  // new app/ directory -- appDirectory just tells the framework where
  // root.jsx / routes.js live and where relative route paths resolve from.
  appDirectory: "src",
  ssr: true,
  presets: [vercelPreset()],
};
