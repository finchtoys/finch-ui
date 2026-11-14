import { createApp, type App as VueApp } from "vue";
import Gallery from "./App.vue";
import type { DemoTheme } from "./theme";

export interface MountOptions {
  theme?: DemoTheme;
  embedded?: boolean;
}

/** Mounts the gallery into `el` and returns an unmount function (used by the UI Lab). */
export function mountGallery(el: Element, options: MountOptions = {}): () => void {
  const app: VueApp = createApp(Gallery, {
    initialTheme: options.theme ?? "light",
    embedded: options.embedded ?? false,
  });
  app.mount(el);
  return () => app.unmount();
}
