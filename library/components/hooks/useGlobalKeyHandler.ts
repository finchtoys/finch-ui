import { useEffect, useRef, type RefObject } from "react";

/**
 * True when a keydown belongs to an active IME composition (Chinese/Japanese/
 * Korean input). Candidate-commit keystrokes (Space/Enter) and composition
 * cancel (Escape) arrive as regular keydown events — acting on them submits or
 * dismisses cards while the user is still picking characters. `keyCode 229`
 * covers platforms/IMEs that don't set `isComposing` on the commit keystroke.
 */
export function isComposingKeyEvent(e: React.KeyboardEvent | KeyboardEvent): boolean {
  const event = "nativeEvent" in e ? e.nativeEvent : e;
  return !!event.isComposing || event.keyCode === 229;
}

/**
 * Register a document-level `keydown` listener that is *ignored* when focus is
 * inside `containerRef` or in a text input/textarea — so the composer's
 * question / permission cards keep their arrow-key navigation working even when
 * the composer textarea (or nothing) currently has focus.
 *
 * The handler is read through a ref, so callers can pass an inline closure
 * (capturing the latest render's state) without re-registering the listener.
 */
export function useGlobalKeyHandler(
  containerRef: RefObject<HTMLElement | null>,
  handler: (e: KeyboardEvent) => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const container = containerRef.current;
      // inert blocks DOM input, not document listeners owned by kept-alive cards.
      if (!container || container.closest("[inert], [hidden], [aria-hidden='true']")) return;
      if (container.contains(e.target as Node)) return;
      const target = e.target as HTMLElement | null;
      // Skip text-entry targets: INPUT/TEXTAREA and contentEditable (the
      // composer's rich input is a contentEditable div, not a TEXTAREA).
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;
      // IME composition keystrokes (candidate commit / cancel) are not commands.
      if (isComposingKeyEvent(e)) return;
      handlerRef.current(e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [containerRef]);
}
