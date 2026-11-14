import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";
import { topmostModalIndex } from "./modalStack";

export interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  zIndex?: number;
  backdropClassName?: string;
  shellClassName?: string;
  children: React.ReactNode;
  role?: string;
  ariaLabel?: string;
  closeLabel: string;
  /** Optional host effect attached while the backdrop is mounted. */
  backdropEffect?: (element: HTMLDivElement) => void | (() => void);
  /** Extra content placed in the header between the title and the close button. */
  headerRight?: React.ReactNode;
  /** When true the default header (title + close button) is not rendered. */
  noHeader?: boolean;
  /** When true, render only the backdrop and its children without the shell wrapper. */
  backdropOnly?: boolean;
  /** Allow clicking the backdrop to close. Defaults to false to prevent accidental dismissal. */
  closeOnBackdrop?: boolean;
}

function isTopmostModal(element: HTMLElement): boolean {
  const modals = [...document.querySelectorAll<HTMLElement>("[data-finch-modal-shell]")];
  const index = topmostModalIndex(modals.map((modal) => Number.parseInt(modal.style.zIndex, 10) || 0));
  return modals[index] === element;
}

export function ModalShell({
  open,
  onClose,
  title,
  zIndex = 200,
  backdropClassName = "bg-black/40",
  shellClassName = "",
  children,
  role,
  ariaLabel,
  closeLabel,
  backdropEffect,
  headerRight,
  noHeader,
  backdropOnly,
  closeOnBackdrop = false,
}: ModalShellProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // A focused Electron <webview> receives keyboard input in its guest page.
  // Release that focus when a host modal opens so document's Escape capture
  // listener runs, without focusing the dialog and showing a focus outline.
  useLayoutEffect(() => {
    if (open) (document.activeElement as HTMLElement | null)?.blur();
  }, [open]);

  useEffect(() => {
    if (!open || !backdropRef.current || !backdropEffect) return;
    return backdropEffect(backdropRef.current);
  }, [backdropEffect, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !backdropRef.current || !isTopmostModal(backdropRef.current)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      (document.activeElement as HTMLElement | null)?.blur();
      onClose();
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={backdropRef}
      data-finch-modal-shell
      className={`fixed inset-0 grid place-items-center ${backdropClassName} animate-overlayIn`}
      style={{ zIndex }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {backdropOnly ? (
        <div
          className="h-full w-full"
          role={role ?? "dialog"}
          aria-modal="true"
          aria-label={ariaLabel ?? title}
        >
          {children}
        </div>
      ) : (
        <div
          className={`settingsModalShell rounded-xl overflow-hidden animate-modalIn ${shellClassName}`}
          onClick={(e) => e.stopPropagation()}
          role={role ?? "dialog"}
          aria-modal="true"
          aria-label={ariaLabel ?? title}
        >
          {!noHeader && (title || headerRight) && (
            <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
              {title ? (
                <h2 className="m-0 font-body text-[16px] font-semibold text-txt">{title}</h2>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                {headerRight}
                <Button icon={<X size={17} />} onClick={onClose} title={closeLabel} aria-label={closeLabel} />
              </div>
            </div>
          )}
          {children}
        </div>
      )}
    </div>,
    document.body
  );
}
