import type { ReactNode } from "react";
import { LoaderCircle, X } from "lucide-react";

import { ModalShell, type ModalShellProps } from "./ModalShell";
import { Button } from "./Button";
import { ScrollArea } from "./ScrollArea";
import {
  CONFIRM_ACTION_CLASS,
  CONFIRM_CLOSE_BUTTON_CLASS,
  CONFIRM_DESCRIPTION_CLASS,
  CONFIRM_FOOTER_CLASS,
  CONFIRM_TITLE_CLASS,
  confirmBodyClassName,
  confirmContentClassName,
  confirmShellClassName,
} from "../styles/classes";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** 可将操作标题降为辅助标签；其他确认框保持默认样式。 */
  titleClassName?: string;
  description?: string;
  children?: ReactNode;
  shellClassName?: string;
  contentClassName?: string;
  /** 正文外层布局，可用于固定外框中的弹性滚动区。 */
  bodyClassName?: string;
  zIndex?: number;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  backdropEffect?: ModalShellProps["backdropEffect"];
  variant?: "danger" | "primary";
  pending?: boolean;
  showCancelButton?: boolean;
  showCloseButton?: boolean;
  hideTitle?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  titleClassName,
  description,
  children,
  shellClassName,
  contentClassName,
  bodyClassName,
  zIndex = 300,
  confirmLabel,
  cancelLabel,
  closeLabel,
  backdropEffect,
  variant = "primary",
  pending = false,
  showCancelButton = true,
  showCloseButton = false,
  hideTitle = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <ModalShell
      open={open}
      onClose={onCancel}
      noHeader
      role="alertdialog"
      ariaLabel={title}
      closeLabel={closeLabel}
      backdropEffect={backdropEffect}
      shellClassName={confirmShellClassName(shellClassName)}
      zIndex={zIndex}
    >
      {showCloseButton ? (
        <Button
          icon={<X size={16} />}
          variant="ghost"
          className={CONFIRM_CLOSE_BUTTON_CLASS}
          onClick={onCancel}
          title={closeLabel}
          aria-label={closeLabel}
        />
      ) : null}
      <div className={confirmBodyClassName({ showCloseButton, hideTitle, bodyClassName })}>
        {!hideTitle ? <p className={titleClassName ?? CONFIRM_TITLE_CLASS}>{title}</p> : null}
        {children ? (
          // Long extension/AppCall confirm content (e.g. a full feedback title+body
          // preview) must not be able to push the footer buttons off-screen — cap
          // the height and let it scroll internally instead.
          <ScrollArea className={confirmContentClassName({ contentClassName, hideTitle })}>{children}</ScrollArea>
        ) : description ? (
          <p className={CONFIRM_DESCRIPTION_CLASS}>{description}</p>
        ) : null}
      </div>
      <div className={CONFIRM_FOOTER_CLASS}>
        {showCancelButton ? (
          <Button variant="secondary" size="md" className={CONFIRM_ACTION_CLASS} onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          variant={variant}
          size="md"
          className={CONFIRM_ACTION_CLASS}
          leadingIcon={pending ? <LoaderCircle size={14} className="animate-spin" /> : undefined}
          disabled={pending}
          aria-busy={pending}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalShell>
  );
}
