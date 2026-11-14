import type { HTMLAttributes, ReactNode } from "react";

interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  /** 直接渲染 icon，不套 bg-sf-hover 方框 */
  plainIcon?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  compact?: boolean;
}

export function Empty({
  icon,
  plainIcon = false,
  title,
  description,
  compact = false,
  className = "",
  children,
  ...props
}: EmptyProps) {
  return (
    <div
      className={`flex min-w-0 w-full flex-col items-center justify-center text-center ${compact ? "gap-2 rounded-sm border border-dotted border-border-subtle px-3 py-4" : "gap-3 px-4 py-6"} ${className}`.trim()}
      {...props}
    >
      {icon ? (
        plainIcon ? (
          <div className="text-txt-tertiary">
          {icon}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-md bg-sf-hover p-3 text-txt-tertiary">
            {icon}
          </div>
        )
      ) : null}
      {title ? <p className="m-0 text-[16px] font-medium text-txt-secondary py-0.5">{title}</p> : null}
      {description ? <p className="m-0 text-[14px] text-txt-tertiary">{description}</p> : null}
      {children}
    </div>
  );
}
