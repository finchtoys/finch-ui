import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import type { ButtonRound, ButtonSize, ButtonVariant } from "./Button";
import { Button, type ButtonProps } from "./Button";
import { Tooltip } from "./Tooltip";
import {
  BUTTON_GROUP_ITEM_WRAP_CLASS,
  buttonGroupClassName,
  buttonGroupItemClassName,
} from "../styles/classes";

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
      className={buttonGroupClassName({ variant, round, disabled, className })}
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
              className: buttonGroupItemClassName({
                variant,
                index,
                iconMode: button.props.icon != null,
                size: button.props.size ?? size,
                className: button.props.className ?? "",
              }),
            }))
          : child;

        return (
          <div key={index} className={BUTTON_GROUP_ITEM_WRAP_CLASS}>
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
