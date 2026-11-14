import type { HTMLAttributes, ReactNode } from "react";
import {
  EMPTY_DESCRIPTION_CLASS,
  EMPTY_ICON_BOX_CLASS,
  EMPTY_PLAIN_ICON_CLASS,
  EMPTY_TITLE_CLASS,
  emptyClassName,
} from "../styles/classes";

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
      className={emptyClassName({ compact, className })}
      {...props}
    >
      {icon ? (
        plainIcon ? (
          <div className={EMPTY_PLAIN_ICON_CLASS}>
          {icon}
          </div>
        ) : (
          <div className={EMPTY_ICON_BOX_CLASS}>
            {icon}
          </div>
        )
      ) : null}
      {title ? <p className={EMPTY_TITLE_CLASS}>{title}</p> : null}
      {description ? <p className={EMPTY_DESCRIPTION_CLASS}>{description}</p> : null}
      {children}
    </div>
  );
}
