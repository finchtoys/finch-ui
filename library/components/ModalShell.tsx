import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";
import { topmostModalIndex } from "./modalStack";
import {
  MODAL_BACKDROP_ONLY_CLASS,
  MODAL_DEFAULT_BACKDROP_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_HEADER_RIGHT_CLASS,
  MODAL_TITLE_CLASS,
  modalBackdropClassName,
  modalShellClassName,
} from "../styles/classes";

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
  backdropClassName = MODAL_DEFAULT_BACKDROP_CLASS,
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
      className={modalBackdropClassName(backdropClassName)}
      style={{ zIndex }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {backdropOnly ? (
        <div
          className={MODAL_BACKDROP_ONLY_CLASS}
          role={role ?? "dialog"}
          aria-modal="true"
          aria-label={ariaLabel ?? title}
        >
          {children}
        </div>
      ) : (
        <div
          className={modalShellClassName(shellClassName)}
          onClick={(e) => e.stopPropagation()}
          role={role ?? "dialog"}
          aria-modal="true"
          aria-label={ariaLabel ?? title}
        >
          {!noHeader && (title || headerRight) && (
            <div className={MODAL_HEADER_CLASS}>
              {title ? <h2 className={MODAL_TITLE_CLASS}>{title}</h2> : <span />}
              <div className={MODAL_HEADER_RIGHT_CLASS}>
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
