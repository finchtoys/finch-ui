/**
 * Theme presets for the demo. The components read `--ui-*`, which resolve to
 * `--finch-*` when the host provides them and to the stylesheet fallbacks
 * otherwise — so a "custom skin" here is simply a few `--finch-*` overrides.
 */
export type DemoTheme = "light" | "dark" | "custom";

const CUSTOM_SKIN: Record<string, string> = {
  "--finch-accent": "#0e9f6e",
  "--finch-accent-dim": "#e6f4ee",
  "--finch-accent-hover": "#0b8a5f",
  "--finch-bg-root": "#f2faf6",
  "--finch-bg-main": "#f7fcfa",
  "--finch-bg-elevated": "#ffffff",
  "--finch-bg-hover": "#e8f4ee",
  "--finch-bg-active": "#d9ece3",
  "--finch-text-primary": "#123227",
  "--finch-text-secondary": "#3d5c50",
  "--finch-text-tertiary": "#6b8479",
  "--finch-border": "rgba(18, 50, 39, 0.14)",
  "--finch-border-subtle": "rgba(18, 50, 39, 0.07)",
  "--finch-info": "#2f7fbf",
  "--finch-positive": "#2f8f5b",
  "--finch-warning": "#c9762e",
  "--finch-danger": "#c0554c",
};

export function applyTheme(theme: DemoTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme === "dark" ? "dark" : "light";
  for (const key of Object.keys(CUSTOM_SKIN)) root.style.removeProperty(key);
  if (theme === "custom") {
    for (const [key, value] of Object.entries(CUSTOM_SKIN)) root.style.setProperty(key, value);
  }
  document.body.style.background = "var(--ui-bg-main)";
  document.body.style.color = "var(--ui-text-primary)";
}
