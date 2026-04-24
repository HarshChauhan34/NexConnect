import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("react-router-dom")) {
            return "react";
          }
          if (id.includes("framer-motion") || id.includes("lucide-react")) {
            return "ui";
          }
          if (id.includes("recharts")) {
            return "charts";
          }
          if (id.includes("socket.io-client")) {
            return "socket";
          }
          return undefined;
        },
      },
    },
  },
});
