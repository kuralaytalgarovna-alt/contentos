import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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
