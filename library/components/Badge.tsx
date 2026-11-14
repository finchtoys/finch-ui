import type { HTMLAttributes, ReactNode } from "react";
import { badgeClassName, freeModelBadgeClassName } from "../styles/classes";
import type { BadgeSize, BadgeVariant } from "../styles/classes";

export type { BadgeSize, BadgeVariant };

export function FreeModelBadge({ isFree, className = "" }: { isFree?: boolean; className?: string }) {
  if (isFree !== true) return null;
  return <Badge className={freeModelBadgeClassName(className)}>Free</Badge>;
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  leadingIcon?: ReactNode;
}

export function Badge({
  variant = "neutral",
  size = "sm",
  leadingIcon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={badgeClassName({ variant, size, className })} {...props}>
      {leadingIcon}
      {children}
    </span>
  );
}
