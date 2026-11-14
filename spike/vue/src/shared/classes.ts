/**
 * The spike no longer owns class strings.
 *
 * After the proposal in docs/vue-spike-findings.md was approved, the canonical
 * module moved into the library: `library/styles/classes.ts`. Both the React
 * components and these Vue components import the same file, so there is exactly
 * one copy of every class string, every inline-style value and the placement
 * algebra behind Menu.
 *
 * Kept as a re-export so the Vue components import through a stable alias and
 * the extra spike-only helpers below stay available.
 */
export * from "@lib/styles/classes";

/**
 * Spike-only, deleted once the library owns a real icon set: lucide-react is a
 * React package, so the two stand-ins (XIcon / StarIcon) reproduce its DOM.
 */
export const SPIKE_ONLY_ICON_NOTE = "lucide-react has no Vue equivalent in this repo";
