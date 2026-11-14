import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Demo gallery for @finchtoys/ui-vue.
 *
 * Reuses `library/dist/style.css` — the point of the package is that Vue needs
 * no Tailwind build. Base is relative so the page also works when served from
 * the UI Lab panel path.
 */
export default defineConfig({
  root: resolve(here, "demo"),
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: [
      { find: /^@shared\//, replacement: `${resolve(here, "../../library/styles")}/` },
      { find: /^@lib\//, replacement: `${resolve(here, "../../library")}/` },
      { find: /^@finch-ui-css$/, replacement: resolve(here, "../../library/dist/style.css") },
      { find: /^@finch-ui-vue$/, replacement: resolve(here, "entry.ts") },
    ],
  },
  server: { port: 5199, strictPort: false },
  build: {
    outDir: resolve(here, "demo-dist"),
    emptyOutDir: true,
    target: "esnext",
  },
});
