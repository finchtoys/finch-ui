import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";
import {
  BREADCRUMB_BUTTON_CLASS,
  BREADCRUMB_BUTTON_LABEL_CLASS,
  BREADCRUMB_ICON_CLASS,
  BREADCRUMB_ITEM_CLASS,
  BREADCRUMB_LEAF_LABEL_CLASS,
  BREADCRUMB_SEPARATOR_CLASS,
  breadcrumbLeafClassName,
  breadcrumbNavClassName,
} from "../styles/classes";

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
    <nav className={breadcrumbNavClassName(className)} aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className={BREADCRUMB_ITEM_CLASS}>
            <Tooltip content={item.label}>
              {item.onClick && !isLast ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className={BREADCRUMB_BUTTON_CLASS}
                  onClick={item.onClick}
                  leadingIcon={item.icon ? (
                    <span className={BREADCRUMB_ICON_CLASS} aria-hidden="true">{item.icon}</span>
                  ) : undefined}
                >
                  <span className={BREADCRUMB_BUTTON_LABEL_CLASS}>{item.label}</span>
                </Button>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={breadcrumbLeafClassName(item.active)}
                >
                  {item.icon ? (
                    <span className={BREADCRUMB_ICON_CLASS} aria-hidden="true">{item.icon}</span>
                  ) : null}
                  <span className={BREADCRUMB_LEAF_LABEL_CLASS}>{item.label}</span>
                </span>
              )}
            </Tooltip>
            {!isLast && (
              <ChevronRight size={14} strokeWidth={1.8} aria-hidden="true" className={BREADCRUMB_SEPARATOR_CLASS} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
