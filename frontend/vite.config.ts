import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    open: true,
    proxy: {
      "/dev": {
        target: "http://localhost:5000", //https://college-react-express.vercel.app/
        changeOrigin: true,

        secure: false,
        rewrite: (path) => path.replace(/^\/dev/, ""),
      },
    },
  },
  resolve: {
    alias: {
      src: "/src",
    },
  },
});
