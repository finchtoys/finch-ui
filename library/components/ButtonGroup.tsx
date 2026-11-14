import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import type { ButtonRound, ButtonSize, ButtonVariant } from "./Button";
import { Button, type ButtonProps } from "./Button";
import { Tooltip } from "./Tooltip";

export interface ButtonGroupProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  round?: ButtonRound;
  className?: string;
  disabled?: boolean;
}

export type ButtonGroupItemProps = Omit<ButtonProps, "variant" | "size" | "round" | "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  round?: ButtonRound;
  className?: string;
};

const GROUP_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white",
  brand: "bg-accent text-white",
  secondary: "bg-[var(--ui-bg-inset)] text-[var(--ui-text-secondary)]",
  ghost: "bg-transparent text-[var(--ui-text-secondary)]",
  outline: "border border-[var(--ui-border-subtle)] bg-transparent text-[var(--ui-text-secondary)]",
  danger: "bg-[var(--ui-danger-dim)] text-[var(--ui-danger-text)]",
  link: "bg-transparent text-[var(--ui-text-secondary)]",
};

const DIVIDER_VARIANT: Record<ButtonVariant, string> = {
  primary: "border-white/25",
  brand: "border-white/25",
  secondary: "border-[var(--ui-border-subtle)]",
  ghost: "border-[var(--ui-border-subtle)]",
  outline: "border-[var(--ui-border-subtle)]",
  danger: "border-[color-mix(in_srgb,var(--ui-danger)_24%,transparent)]",
  link: "border-[var(--ui-border-subtle)]",
};

const ITEM_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "!text-white hover:!bg-[color-mix(in_srgb,var(--ui-accent)_90%,transparent)] active:!brightness-95",
  brand:
    "!text-white hover:!bg-[color-mix(in_srgb,var(--ui-accent)_90%,#666)] active:!brightness-95",
  secondary:
    "hover:!bg-[var(--ui-bg-hover)] hover:!text-[var(--ui-text-primary)] active:!bg-[var(--ui-bg-active)]",
  ghost:
    "hover:!bg-[var(--ui-bg-hover)] hover:!text-[var(--ui-text-primary)] active:!bg-[var(--ui-bg-active)]",
  outline:
    "hover:!bg-[var(--ui-bg-hover)] hover:!text-[var(--ui-text-primary)] hover:!border-[var(--ui-border-subtle)] active:!bg-[var(--ui-bg-active)]",
  danger:
    "hover:!bg-[color-mix(in_srgb,var(--ui-danger)_16%,transparent)] active:!bg-[color-mix(in_srgb,var(--ui-danger)_22%,transparent)]",
  link:
    "hover:!text-[var(--ui-text-secondary)] hover:underline hover:underline-offset-3 active:!text-[var(--ui-text-secondary)]",
};

const GROUP_ICON_SIZE: Record<ButtonSize, string> = {
  sm: "!h-[21px] !w-[21px]",
  md: "!h-[28px] !w-[28px]",
  lg: "!h-[36px] !w-[36px]",
};

const ROUND: Record<ButtonRound, string> = {
  sm: "rounded-[var(--ui-radius-sm)]",
  md: "rounded-[var(--ui-radius-md)]",
  lg: "rounded-[var(--ui-radius-lg)]",
  full: "rounded-full",
};

function isButtonElement(child: ReactNode): child is ReactElement<ButtonProps> {
  return isValidElement(child) && child.type === Button;
}

/** Unwrap a `<Tooltip><Button/></Tooltip>` pairing so we can still find and
 *  clone the inner Button for group styling, while re-wrapping the result in
 *  the original Tooltip so the trigger element stays correct. */
function unwrapButton(child: ReactNode): { button: ReactElement<ButtonProps> | null; rewrap: (button: ReactElement) => ReactNode } {
  if (isButtonElement(child)) return { button: child, rewrap: (button) => button };
  if (isValidElement(child) && child.type === Tooltip) {
    const inner = (child.props as { children?: ReactNode }).children;
    if (isButtonElement(inner)) {
      return { button: inner, rewrap: (button) => cloneElement(child, { children: button } as Partial<{ children: ReactNode }>) };
    }
  }
  return { button: null, rewrap: (button) => button };
}

export function ButtonGroup({
  children,
  variant = "secondary",
  size = "md",
  round = "sm",
  className = "",
  disabled = false,
}: ButtonGroupProps) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <div
      className={[
        "inline-flex items-stretch overflow-hidden select-none",
        GROUP_VARIANT[variant],
        ROUND[round],
        disabled ? "opacity-40 pointer-events-none" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {items.map((child, index) => {
        const { button, rewrap } = unwrapButton(child);
        const childVariant = button ? button.props.variant ?? variant : variant;
        const content = button
          ? rewrap(cloneElement(button, {
              variant: childVariant,
              size: button.props.size ?? size,
              round: "sm",
              disabled: disabled || button.props.disabled,
              className: [
                "rounded-none !border-0 shadow-none active:scale-100",
                index > 0 ? `!border-l ${DIVIDER_VARIANT[variant]}` : "",
                button.props.icon != null ? GROUP_ICON_SIZE[button.props.size ?? size] : " pl-2.5",
                ITEM_VARIANT[childVariant],
                button.props.className ?? "",
              ].filter(Boolean).join(" "),
            }))
          : child;

        return (
          <div key={index} className="flex items-stretch">
            {content}
          </div>
        );
      })}
    </div>
  );
}

export function ButtonGroupItem(props: ButtonGroupItemProps) {
  return <Button {...props} />;
}
