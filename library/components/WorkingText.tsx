import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

interface WorkingTextProps extends HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  children: ReactNode;
  tone?: "primary" | "secondary" | "tertiary" | "accent";
}

export function WorkingText({
  active = false,
  tone = "secondary",
  children,
  className = "",
  style,
  ...props
}: WorkingTextProps) {
  const cssVars = {
    "--working-text-base":
      tone === "accent"
        ? "var(--ui-accent)"
        : tone === "primary"
          ? "var(--ui-text-primary)"
          : tone === "tertiary"
            ? "var(--ui-text-tertiary)"
            : "var(--ui-text-secondary)",
    "--working-text-highlight":
      tone === "accent"
        ? "color-mix(in srgb, var(--ui-accent) 64%, var(--ui-accent))"
        : tone === "primary"
          ? "color-mix(in srgb, white 58%, var(--ui-text-primary))"
          : tone === "tertiary"
            ? "color-mix(in srgb, white 60%, var(--ui-text-tertiary))"
            : "color-mix(in srgb, white 58%, var(--ui-text-secondary))",
  } as CSSProperties;

  return (
    <span
      className={`workingText ${active ? "workingText--active" : ""} ${className}`.trim()}
      style={{ ...cssVars, ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
