import type { HTMLAttributes } from "react";

interface SkeletonBlockProps extends HTMLAttributes<HTMLDivElement> {}

export function SkeletonBlock({ className = "", ...props }: SkeletonBlockProps) {
  return <div className={`usageSkeleton ${className}`.trim()} {...props} />;
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
    <div className="flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[var(--ui-radius-lg)] bg-sf-elevated px-4.5 py-5 gap-2 select-none">
      {/* header — mirrors ToolcaseCatalogCard header row */}
      <div className="flex min-w-0 items-center gap-2 h-[28px]">
        <div className="min-w-0 flex-1 overflow-hidden">
          <SkeletonBlock className="h-[14px] rounded" style={{ width: titleW }} />
        </div>
        <div className="flex flex-none items-center">
          {/* action placeholder: install-button shape */}
          <SkeletonBlock className="h-[26px] w-[52px] rounded-[var(--ui-radius-md)]" />
        </div>
      </div>
      {/* description: 3 lines, first always full-width */}
      <div className="flex flex-col gap-[7px] pt-0.5">
        <SkeletonBlock className="h-[11px] w-full rounded" />
        <SkeletonBlock className="h-[11px] rounded" style={{ width: d2 }} />
        <SkeletonBlock className="h-[11px] rounded" style={{ width: d3 }} />
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
    <div className="grid w-full min-w-0 grid-cols-3 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCatalogCard key={i} index={i} />
      ))}
    </div>
  );
}
