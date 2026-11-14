/**
 * The Vue preview is imported through `packages/vue/demo`, whose SFCs are
 * compiled by @vitejs/plugin-vue at build time. Plain `tsc` only needs to know
 * that a `.vue` module has a default export.
 */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
