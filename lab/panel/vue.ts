/**
 * Vue side of the UI Lab panel.
 *
 * Loaded on demand from the React panel (`import("./vue")`) so the Vue runtime
 * never lands in the initial bundle. The gallery is the same one as
 * `packages/vue/demo` — one implementation, two entry points.
 */
import "../../packages/vue/demo/gallery.css";
import { mountGallery } from "../../packages/vue/demo/mount";

export function mount(el: Element): () => void {
  return mountGallery(el, { embedded: true });
}
