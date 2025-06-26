import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 네이버 검색 API 프록시
      "/api/naver": {
        target: "https://openapi.naver.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/naver/, ""),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LunchHunt/1.0)",
        },
      },
    },
  },
});
