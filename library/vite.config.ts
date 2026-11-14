import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: {
    target: 'esnext', outDir: 'dist', emptyOutDir: true,
    lib: { entry: resolve('entry.ts'), formats: ['es'], fileName: () => 'index.js', cssFileName: 'style' },
    rollupOptions: { external: [/^react(?:\/|$)/, /^react-dom(?:\/|$)/, /^lucide-react(?:\/|$)/] },
  },
  plugins: [{ name: 'library-module-evidence', generateBundle(_options, bundle) {
    const modules = Object.values(bundle).flatMap(item => item.type === 'chunk' ? Object.keys(item.modules) : []);
    this.emitFile({ type: 'asset', fileName: 'modules.json', source: JSON.stringify(modules.map(m => m.replace(process.cwd(), '.')), null, 2) });
  } }],
});
