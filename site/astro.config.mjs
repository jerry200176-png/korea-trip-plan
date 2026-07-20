import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jerry200176-png.github.io/korea-trip-plan",
  base: "/korea-trip-plan",
  output: "static",
  compressHTML: true,
  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
});
