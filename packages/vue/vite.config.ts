import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Library build for @finchtoys/ui-vue.
 *
 * - `vue` stays external (peer dependency) — a panel must not get a second Vue.
 * - `@finchtoys/ui` is only needed for its prebuilt stylesheet, which the
 *   consumer imports itself; nothing is imported from it at runtime, so the
 *   shared class module is inlined at build time (rollup reads the source).
 * - No CSS is emitted: the whole point is reusing @finchtoys/ui/style.css.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: /^@shared\//, replacement: `${resolve(here, "../../library/styles")}/` },
    ],
  },
  build: {
    target: "esnext",
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(here, "entry.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [/^vue(?:\/|$)/],
    },
  },
});
