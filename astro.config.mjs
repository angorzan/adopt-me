// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    routes: {
      strategy: "auto",
    },
  }),
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
  },
});
