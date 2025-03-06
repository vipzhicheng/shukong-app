import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    electron({
      entry: "electron/main.js",
    }),
  ],
  base: process.env.ELECTRON == "true" ? "./" : "/",
  server: {
    host: true, // 允许局域网访问
    port: 5175, // 默认端口
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
    // 确保将 public 目录下的文件复制到构建目录
    assetsInclude: ["**/*.json"],
  },
});
