import type { ReactNode } from "react";
import { LoaderCircle, X } from "lucide-react";

import { ModalShell, type ModalShellProps } from "./ModalShell";
import { Button } from "./Button";
import { ScrollArea } from "./ScrollArea";

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
      shellClassName={`relative ${shellClassName ?? "w-[min(360px,calc(100vw-32px))]"}`}
      zIndex={zIndex}
    >
      {showCloseButton ? (
        <Button
          icon={<X size={16} />}
          variant="ghost"
          className="absolute right-3 top-3 z-10"
          onClick={onCancel}
          title={closeLabel}
          aria-label={closeLabel}
        />
      ) : null}
      <div className={`px-5 pt-5 pb-[18px] ${showCloseButton && !hideTitle ? "pr-12" : ""} ${bodyClassName ?? ""}`}>
        {!hideTitle ? <p className={titleClassName ?? "m-0 text-[15px] font-semibold leading-5 text-txt"}>{title}</p> : null}
        {children ? (
          // Long extension/AppCall confirm content (e.g. a full feedback title+body
          // preview) must not be able to push the footer buttons off-screen — cap
          // the height and let it scroll internally instead.
          <ScrollArea className={`${contentClassName ?? "max-h-[50vh]"} ${hideTitle ? "" : "mt-3"}`}>{children}</ScrollArea>
        ) : description ? (
          <p className="mt-2 mb-0 text-[13px] leading-5 text-txt-secondary">{description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle px-4 py-3">
        {showCancelButton ? (
          <Button variant="secondary" size="md" className="min-w-[76px]" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          variant={variant}
          size="md"
          className="min-w-[76px]"
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
