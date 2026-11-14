import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { workingTextClassName, workingTextStyle } from "../styles/classes";

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
  const cssVars = workingTextStyle({ tone }) as CSSProperties;

  return (
    <span
      className={workingTextClassName({ active, className })}
      style={{ ...cssVars, ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
