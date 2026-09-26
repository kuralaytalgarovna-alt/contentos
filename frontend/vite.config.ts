import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project pages on GitHub Pages are served from https://<user>.github.io/<repo>/,
// so asset URLs need that base path baked in at build time. Set via env var
// so local dev and other deploy targets (e.g. Render, which serves from "/")
// are unaffected.
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8000",
      // Trailing slash so this only matches asset requests like
      // "/media/<project>/<file>", not the "/media-library" SPA route.
      "/media/": "http://127.0.0.1:8000",
    },
  },
});
