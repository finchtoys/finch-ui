import type { HTMLAttributes } from "react";
import {
  SKELETON_CARD_ACTION_CLASS,
  SKELETON_CARD_ACTION_WRAP_CLASS,
  SKELETON_CARD_LINE_CLASS,
  SKELETON_CARD_LINE_FULL_CLASS,
  SKELETON_CARD_TITLE_BAR_CLASS,
  SKELETON_CARD_DESC_CLASS,
  SKELETON_CARD_GRID_CLASS,
  SKELETON_CARD_HEADER_CLASS,
  SKELETON_CARD_TITLE_WRAP_CLASS,
  SKELETON_CARD_CLASS,
  skeletonBlockClassName,
} from "../styles/classes";

interface SkeletonBlockProps extends HTMLAttributes<HTMLDivElement> {}

export function SkeletonBlock({ className = "", ...props }: SkeletonBlockProps) {
  return <div className={skeletonBlockClassName(className)} {...props} />;
}

// ── Catalog card skeleton ─────────────────────────────────────────────────────────
// Matches ToolcaseCatalogCard with className="py-5 gap-2":
//   header row (h-28px): title bar + action button shape
//   description: 3 lines with staggered widths

const CARD_TITLE_WIDTHS = [140, 176, 108, 160, 124, 152];
const CARD_DESC_WIDTHS: [string, string][] = [
  ["88%", "72%"],
  ["84%", "68%"],
  ["92%", "76%"],
  ["80%", "64%"],
  ["90%", "70%"],
  ["86%", "74%"],
];

export function SkeletonCatalogCard({ index = 0 }: { index?: number }) {
  const titleW = CARD_TITLE_WIDTHS[index % CARD_TITLE_WIDTHS.length];
  const [d2, d3] = CARD_DESC_WIDTHS[index % CARD_DESC_WIDTHS.length];
  return (
    <div className={SKELETON_CARD_CLASS}>
      {/* header — mirrors ToolcaseCatalogCard header row */}
      <div className={SKELETON_CARD_HEADER_CLASS}>
        <div className={SKELETON_CARD_TITLE_WRAP_CLASS}>
          <SkeletonBlock className={SKELETON_CARD_TITLE_BAR_CLASS} style={{ width: titleW }} />
        </div>
        <div className={SKELETON_CARD_ACTION_WRAP_CLASS}>
          {/* action placeholder: install-button shape */}
          <SkeletonBlock className={SKELETON_CARD_ACTION_CLASS} />
        </div>
      </div>
      {/* description: 3 lines, first always full-width */}
      <div className={SKELETON_CARD_DESC_CLASS}>
        <SkeletonBlock className={SKELETON_CARD_LINE_FULL_CLASS} />
        <SkeletonBlock className={SKELETON_CARD_LINE_CLASS} style={{ width: d2 }} />
        <SkeletonBlock className={SKELETON_CARD_LINE_CLASS} style={{ width: d3 }} />
      </div>
    </div>
  );
}

/**
 * Fixed 3-column grid of catalog card skeletons.
 * Use during community data fetch so the layout intent is clear before content arrives.
 */
export function SkeletonCatalogGrid({ count = 6 }: { count?: number }) {
  return (
    <div className={SKELETON_CARD_GRID_CLASS}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCatalogCard key={i} index={i} />
      ))}
    </div>
  );
}
