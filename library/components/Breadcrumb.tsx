import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
  /** Optional leading icon rendered before the label. */
  icon?: ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  ariaLabel: string;
  className?: string;
}

/**
 * A compact Button-based breadcrumb for view chrome.
 *
 * `Skill \ ... \ Feature` pattern: each segment is a low-emphasis Button;
 * the last segment is rendered as the current (non-clickable) leaf.
 * Each item keeps its natural width until space runs out, then its label
 * shrinks and ellipsizes. Icons/separators stay fixed; the full label is
 * available in a tooltip. Max-content grid limits preserve short items while
 * sharing remaining width between long ones; each inner flex layer can shrink.
 */
export function Breadcrumb({ items, ariaLabel, className = "" }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className={`grid min-w-0 max-w-full grid-flow-col auto-cols-[minmax(0,max-content)] items-center ${className}`.trim()} aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex min-w-0 items-center">
            <Tooltip content={item.label}>
              {item.onClick && !isLast ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-w-0 flex-1 text-txt-tertiary hover:text-txt py-3.5"
                  onClick={item.onClick}
                  leadingIcon={item.icon ? (
                    <span className="inline-flex shrink-0 items-center" aria-hidden="true">{item.icon}</span>
                  ) : undefined}
                >
                  <span className="min-w-0 truncate font-medium">{item.label}</span>
                </Button>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={`inline-flex h-7 min-w-0 flex-1 items-center gap-1.5 px-2 text-[14px] font-medium ${
                    item.active ? "text-txt" : "text-txt-tertiary"
                  }`}
                >
                  {item.icon ? (
                    <span className="inline-flex shrink-0 items-center" aria-hidden="true">{item.icon}</span>
                  ) : null}
                  <span className="min-w-0 truncate">{item.label}</span>
                </span>
              )}
            </Tooltip>
            {!isLast && (
              <ChevronRight size={14} strokeWidth={1.8} aria-hidden="true" className="mx-0.5 shrink-0 text-txt-tertiary/60" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
