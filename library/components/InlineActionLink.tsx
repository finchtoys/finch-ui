import type { ButtonHTMLAttributes, ReactNode } from "react";

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
  const classes = [
    "group inline-flex align-baseline min-w-0 cursor-pointer items-center gap-[7px] rounded-[var(--ui-radius-sm)] border-0 bg-transparent px-[3px] py-[2px] text-left text-accent-text transition-colors duration-[var(--ui-duration-fast)] ease-[var(--ui-ease-out)] hover:bg-[color-mix(in_srgb,var(--ui-accent)_8%,transparent)] hover:text-[var(--ui-accent-hover)]",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      {...props}
    >
      {leadingIcon ? <span className="inline-flex flex-none text-current opacity-[0.82] transition-opacity duration-[var(--ui-duration-fast)] ease-[var(--ui-ease-out)] group-hover:opacity-100">{leadingIcon}</span> : null}
      {/* Export the label baseline, not the leading icon's bottom edge, to surrounding prose. */}
      <span className="block self-baseline min-w-0 overflow-hidden text-ellipsis whitespace-nowrap underline decoration-[color-mix(in_srgb,currentColor_36%,transparent)] decoration-1 underline-offset-4">{children}</span>
      {trailingIcon ? <span className="inline-flex flex-none text-current opacity-[0.82] transition-opacity duration-[var(--ui-duration-fast)] ease-[var(--ui-ease-out)] group-hover:opacity-100">{trailingIcon}</span> : null}
    </button>
  );
}
