import type { CSSProperties, ReactNode } from "react";
import { EmojiText } from "./Emoji";
import {
  LIST_ROW_ICON_CLASS,
  LIST_ROW_TITLE_WRAP_CLASS,
  LIST_ROW_RIGHT_CLASS,
  LIST_ROW_SUBTITLE_CLASS,
  listRowClassName,
  listRowFloatClassName,
  listRowFloatOverlayClassName,
  listRowMetaClassName,
  listRowTitleClassName,
} from "../styles/classes";

/**
 * Unified list-row layout used across both sidebars.
 *
 * Layout: [icon?] [title — gradient fade, flex-1] [meta] [float-overlay on hover]
 *
 * The float area sits on top of meta when the row is hovered — status dots,
 * action icons, etc. appear there without shifting the layout.
 */
export interface ListRowActivation {
  shiftKey: boolean;
}

export interface ListRowProps {
  /** Optional leading icon (16px target) */
  icon?: ReactNode;
  /** Primary label — truncated with gradient fade */
  title?: string;
  /** Optional second line under the title (IM-style preview text) */
  subtitle?: ReactNode;
  /** Override the title span content entirely (e.g. for an inline edit input) */
  titleNode?: ReactNode;
  /** Use monospace font for paths / codes */
  titleMono?: boolean;
  /** Right-side static info (time, badge…) — hidden on hover when floatContent is set */
  meta?: ReactNode;
  /** Right-side hover content that overlays meta (action buttons, status icons…) */
  floatContent?: ReactNode;
  /** Whether to always show floatContent (not just on hover) — e.g. when a menu is open */
  floatVisible?: boolean;
  /** Native tooltip — use for full paths / long labels */
  tooltip?: string;
  /** Extra left inset for nested content while keeping the row itself full-width/clickable */
  indent?: number;
  onClick?: (event: ListRowActivation) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  /**
   * Mark this row itself as the native drag source — used by reorderable sidebar
   * groups, so dragging inside nested rows (e.g. inline rename inputs) never
   * starts a drag of the whole group.
   */
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  isActive?: boolean;
  className?: string;
  /**
   * 行在列表里的稳定标识，落到 `data-row-key` 上。列表重排后要靠它找回这一行
   * （例如把正在聊的那条滚回视野），所以必须是行自己的 key，不能用位置。
   */
  rowKey?: string;
  /** Extra children appended inside the row (e.g. portaled popovers) */
  children?: ReactNode;
}

export function ListRow({
  icon,
  title,
  subtitle,
  titleNode,
  titleMono,
  meta,
  floatContent,
  floatVisible,
  tooltip,
  indent,
  onClick,
  onContextMenu,
  draggable,
  onDragStart,
  onDragEnd,
  isActive,
  className,
  rowKey,
  children,
}: ListRowProps) {
  const hasInteraction = !!(onClick || onContextMenu);
  const hasRightZone = meta != null;
  const hasHoverOnlyFloat = floatContent != null && meta == null;
  const shouldHoverFade = hasRightZone || hasHoverOnlyFloat || floatVisible;
  const contentIndentStyle: CSSProperties | undefined = indent != null && indent > 0
    ? { marginLeft: `${indent}px` }
    : undefined;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={listRowClassName({ isActive, hasIcon: icon != null, hasInteraction, className })}

      title={tooltip}
      data-row-key={rowKey}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick ? (event) => onClick(event) : undefined}
      onContextMenu={onContextMenu}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick({ shiftKey: e.shiftKey }); } } : undefined}
    >
      {icon != null && (
        <span className={LIST_ROW_ICON_CLASS} style={contentIndentStyle}>
          {icon}
        </span>
      )}

      {/* Title with right-edge gradient fade */}
      <div className={LIST_ROW_TITLE_WRAP_CLASS}>
        <div
          className={listRowTitleClassName({ hoverFade: shouldHoverFade, mono: titleMono })}
          style={icon == null ? contentIndentStyle : undefined}
        >
          {titleNode ?? (title != null ? <EmojiText text={title} /> : undefined)}
        </div>
        {subtitle != null ? (
          <div className={LIST_ROW_SUBTITLE_CLASS}>
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Right zone: meta (fades out on hover) + float (appears on hover) */}
      {hasRightZone && (
        <span className={LIST_ROW_RIGHT_CLASS} style={{ minWidth: "20px" }}>
          {meta != null && (
            <span className={listRowMetaClassName({ hasFloat: floatContent != null, floatVisible: !!floatVisible })}>
              {meta}
            </span>
          )}
          {floatContent != null && (
            <span className={listRowFloatClassName({ floatVisible: !!floatVisible })}>
              {floatContent}
            </span>
          )}
        </span>
      )}
      {hasHoverOnlyFloat && (
        <span className={listRowFloatOverlayClassName({ floatVisible: !!floatVisible })}>
          {floatContent}
        </span>
      )}

      {children}
    </div>
  );
}
