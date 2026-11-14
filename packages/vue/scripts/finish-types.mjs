/**
 * vue-tsc emits the declaration tree under dist/types (mirroring the source
 * layout, which includes library/styles/classes.ts). Consumers get a single
 * entry point; this writes it.
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(resolve(here, "../dist/index.d.ts"), 'export * from "./types/packages/vue/entry";\n');
