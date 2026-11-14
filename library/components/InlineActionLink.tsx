import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  INLINE_ACTION_LINK_ICON_CLASS,
  INLINE_ACTION_LINK_LABEL_CLASS,
  inlineActionLinkClassName,
} from "../styles/classes";

interface InlineActionLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function InlineActionLink({
  children,
  className = "",
  leadingIcon,
  trailingIcon,
  type = "button",
  ...props
}: InlineActionLinkProps) {
  const classes = inlineActionLinkClassName(className);

  return (
    <button
      type={type}
      className={classes}
      {...props}
    >
      {leadingIcon ? <span className={INLINE_ACTION_LINK_ICON_CLASS}>{leadingIcon}</span> : null}
      {/* Export the label baseline, not the leading icon's bottom edge, to surrounding prose. */}
      <span className={INLINE_ACTION_LINK_LABEL_CLASS}>{children}</span>
      {trailingIcon ? <span className={INLINE_ACTION_LINK_ICON_CLASS}>{trailingIcon}</span> : null}
    </button>
  );
}
