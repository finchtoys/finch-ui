import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// The harness ships React AND Vue in one page on purpose: the two trees must be
// measured by the same engine, in the same stylesheet, at the same window size.
// This is a comparison rig, not a product bundle.
export default defineConfig({
  base: "./",
  plugins: [vue()],
  esbuild: { jsx: "automatic" },
  resolve: {
    // The library source lives outside this package, so its bare `react`
    // imports would otherwise resolve to the monorepo root copy while the
    // harness uses this package's copy — two Reacts, and hooks blow up with
    // "Cannot read properties of null (reading 'useRef')". Pin both sides.
    dedupe: ["react", "react-dom", "lucide-react"],
    alias: [
      { find: /^react$/, replacement: resolve(here, "node_modules/react") },
      { find: /^react\/jsx-runtime$/, replacement: resolve(here, "node_modules/react/jsx-runtime.js") },
      { find: /^react\/jsx-dev-runtime$/, replacement: resolve(here, "node_modules/react/jsx-dev-runtime.js") },
      { find: /^react-dom$/, replacement: resolve(here, "node_modules/react-dom") },
      { find: /^react-dom\/client$/, replacement: resolve(here, "node_modules/react-dom/client.js") },
      { find: /^lucide-react$/, replacement: resolve(here, "node_modules/lucide-react") },
      // Read the React originals straight from the library source. Nothing in
      // library/ or lab/ is modified.
      { find: /^@lib\//, replacement: `${resolve(here, "../../library")}/` },
      // The PREBUILT stylesheet both frameworks share.
      { find: /^@css$/, replacement: resolve(here, "../../library/dist/style.css") },
      // Framework-neutral class strings used by BOTH sides (proposal under test).
      { find: /^@shared\//, replacement: `${resolve(here, "src/shared")}/` },
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: resolve(here, "index.html"),
    },
  },
});
