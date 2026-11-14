import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// The panel page is a self-contained React app. The host webview loads it over
// http://127.0.0.1:<port>/__finch_ext__/<id>/dist/panel.html, so use a RELATIVE
// base ("./") — an absolute "/" base would escape the extension path prefix.
// Tailwind runs through postcss.config.js (@tailwindcss/postcss), same as the
// main repo's Vite setup.
export default defineConfig({
  base: "./",
  css: { postcss: { plugins: [] } }, // Consumer deliberately has NO Tailwind plugin.
  plugins: [vue(), { name: "panel-module-evidence", generateBundle(_options, bundle) {
    const modules = Object.values(bundle).flatMap(item => item.type === "chunk" ? Object.keys(item.modules) : []);
    this.emitFile({ type: "asset", fileName: "panel/modules.json", source: JSON.stringify(modules.map(m => m.replace(here, ".")), null, 2) });
    // Per-chunk evidence: the Vue preview is a dynamic chunk, and the whole
    // point of loading it lazily is that the ENTRY chunk stays React-only.
    const chunks = Object.values(bundle)
      .filter(item => item.type === "chunk")
      .map(item => ({
        name: item.name,
        file: item.fileName,
        bytes: Buffer.byteLength(item.code),
        isEntry: item.isEntry,
        modules: Object.keys(item.modules).map(m => m.replace(here, ".")),
      }));
    this.emitFile({ type: "asset", fileName: "panel/chunks.json", source: JSON.stringify(chunks, null, 2) });
  } }],
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      // The Vue preview reuses packages/vue/demo, which resolves the component
      // source and the shared class module through these aliases.
      { find: /^@finch-ui-vue$/, replacement: resolve(here, "../packages/vue/entry.ts") },
      { find: /^@shared\//, replacement: `${resolve(here, "../library/styles")}/` },
      { find: /^@lib\//, replacement: `${resolve(here, "../library")}/` },
    ],
  },
  build: {
    // Panel assets land under dist/panel/ (via the entryFileNames prefix) so
    // they never collide with the extension backend (tsc → dist/index.js).
    // Build panel BEFORE backend: emptyOutDir clears dist/, then tsc adds the
    // backend without touching dist/panel/.
    outDir: "dist",
    emptyOutDir: false, // Preserve the independently compiled dist/ui library.
    // The guest is a modern Electron Chromium webview — no legacy transforms.
    target: "esnext",
    // Keep everything inline-friendly & small; the static server serves each
    // asset with a correct MIME type, so separate js/css chunks are fine.
    rollupOptions: {
      input: resolve(here, "panel/index.html"),
      output: {
        entryFileNames: "panel/[name].js",
        chunkFileNames: "panel/[name].js",
        assetFileNames: "panel/[name][extname]",
      },
    },
  },
});
