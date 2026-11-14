import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "neutral" | "accent" | "warning" | "danger" | "success";

export function FreeModelBadge({ isFree, className = "" }: { isFree?: boolean; className?: string }) {
  if (isFree !== true) return null;
  return (
    <Badge className={`ml-1 mb-0.5 text-[10px]! h-[16px]! flex-none bg-accent! text-white! ${className}`.trim()}>
      Free
    </Badge>
  );
}

type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  leadingIcon?: ReactNode;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  neutral: "bg-sf-hover text-txt-tertiary",
  accent: "bg-accent-dim text-accent",
  warning: "bg-warn-dim text-warn-text",
  danger: "bg-err-dim text-err-text",
  success: "bg-ok-dim text-ok-text",
};

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[11px]",
  md: "px-2 py-1 text-[12px]",
};

export function Badge({
  variant = "neutral",
  size = "sm",
  leadingIcon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--ui-radius-sm)] font-medium ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim()}
      {...props}
    >
      {leadingIcon}
      {children}
    </span>
  );
}
