import type { ReactNode, RefObject } from "react";
import { Tooltip } from "./Tooltip";

/**
 * One tab entry in an icon-centric tab bar.
 * - `align: "end"` pushes the tab (and any subsequent end tabs) to the far right.
 * - `animRef` — ref to an `@animateicons` icon handle; `startAnimation()` is called on hover.
 * - `iconClassName` — extra CSS class on the icon wrapper span (e.g. for CSS keyframe animations).
 * - `tooltip` — custom tooltip content (overrides the default label-only tooltip).
 * - `badge` — show a numbered unread badge on the icon (top-right corner); hidden when 0 or undefined.
 */
export interface IconTabItem<K extends string = string> {
  key: K;
  icon: ReactNode;
  label: string;
  align?: "start" | "end";
  /** Always render icon-only, even when active (label is used only as tooltip). */
  iconOnly?: boolean;
  /** Ref to an @animateicons icon handle — `startAnimation()` fires on mouse-enter. */
  animRef?: RefObject<{ startAnimation: () => void; stopAnimation: () => void } | null>;
  /** Extra class applied to the icon wrapper span (useful for CSS-driven hover animations). */
  iconClassName?: string;
  /** Custom tooltip content — shown on hover. Falls back to `label` when omitted. */
  tooltip?: ReactNode;
  /** Unread count badge on the icon's top-right corner. Hidden when 0 or undefined. */
  badge?: number;
}

interface IconTabProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  pushEnd: boolean;
  iconOnly: boolean;
  iconClassName?: string;
  animRef?: RefObject<{ startAnimation: () => void; stopAnimation: () => void } | null>;
  tooltip?: ReactNode;
  badge?: number;
  onSelect: () => void;
  onReselect?: () => void;
}

/**
 * A single icon tab.
 * - Inactive: icon-only, square 28×28 hit area.
 * - Active: pill with icon + label, highlighted background, animated width/opacity.
 * - `iconOnly`: stays icon-only in every state; the label only feeds the tooltip.
 * - `dot`: shows a small accent-colored unread dot at the top-right of the icon.
 * - `onReselect`: fires when the user clicks an already-active tab (e.g. jump to first unread).
 */
function IconTab({ icon, label, active, pushEnd, iconOnly, iconClassName, animRef, tooltip, badge, onSelect, onReselect }: IconTabProps) {
  const handleClick = () => {
    if (active && onReselect) {
      onReselect();
    } else {
      onSelect();
    }
  };

  return (
    <Tooltip content={tooltip ?? label} placement="bottom" delay={400}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        onMouseEnter={() => animRef?.current?.startAnimation()}
        onMouseLeave={() => animRef?.current?.stopAnimation()}
        className={`iconTab ${pushEnd ? "ml-auto " : ""}flex items-center overflow-hidden rounded-[var(--ui-radius-md)] transition-all duration-200 ease-out ${
          active ? "iconTab--active text-txt" : "text-txt-tertiary hover:text-txt-secondary"
        }`}
      >
        {/* Icon wrapper — outer span anchors the badge, inner span carries the animation */}
        <span className="relative inline-flex flex-none items-center justify-center">
          <span className={`inline-flex items-center justify-center${iconClassName ? ` ${iconClassName}` : ""}`}>
            {icon}
          </span>
          {!!badge && badge > 0 && (
            <span
              className={`pointer-events-none absolute top-[-4px] right-[-4px] flex h-[11px] min-w-[11px] items-center justify-center rounded-full bg-badge px-[3px] text-[8px] font-bold leading-none text-white`}
              // style={{ boxShadow: "0 0 0 1.5px var(--ui-bg-sidebar)" }}
              aria-hidden="true"
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </span>
        {!iconOnly && (
          <span
            className={`iconTabLabel whitespace-nowrap text-[14px] font-bold transition-all duration-150 ${
              active ? "ml-1 opacity-100" : "ml-0 max-w-0 opacity-0"
            }`}
          >
            {label}
          </span>
        )}
      </button>
    </Tooltip>
  );
}

interface IconTabBarProps<K extends string> {
  tabs: IconTabItem<K>[];
  activeKey: K;
  onChange: (key: K) => void;
  /** Called when the user clicks the already-active tab. */
  onReselect?: (key: K) => void;
  className?: string;
}

/**
 * Icon-centric tab bar. Renders a flat list of tabs; the first tab marked
 * `align: "end"` is pushed to the far right (and stays grouped with later
 * end tabs). The selected tab expands into a labelled pill, the rest stay
 * icon-only — see styles.css `.iconTab` rules for the transition.
 */
export function IconTabBar<K extends string>({
  tabs,
  activeKey,
  onChange,
  onReselect,
  className = "",
}: IconTabBarProps<K>) {
  let endApplied = false;
  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      {tabs.map((tab) => {
        const pushEnd = tab.align === "end" && !endApplied;
        if (pushEnd) endApplied = true;
        return (
          <IconTab
            key={tab.key}
            icon={tab.icon}
            label={tab.label}
            active={activeKey === tab.key}
            pushEnd={pushEnd}
            iconOnly={tab.iconOnly ?? false}
            iconClassName={tab.iconClassName}
            animRef={tab.animRef}
            tooltip={tab.tooltip}
            badge={tab.badge}
            onSelect={() => onChange(tab.key)}
            onReselect={onReselect ? () => onReselect(tab.key) : undefined}
          />
        );
      })}
    </div>
  );
}
