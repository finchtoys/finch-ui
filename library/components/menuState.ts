// Host-document coordination for MenuPopover/MenuSubmenu instances.

let openCount = 0;
const listeners = new Set<() => void>();
const closeAllListeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function menuStateOpen() {
  openCount++;
  notify();
}

export function menuStateClose() {
  openCount = Math.max(0, openCount - 1);
  notify();
}

export function isAnyMenuOpen(): boolean {
  return openCount > 0;
}

/** Returns an unsubscribe function. */
export function subscribeMenuState(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Force-closes every currently open MenuPopover/MenuSubmenu instance.
 *
 * Needed because document-level pointer events do not cross an Electron
 * `<webview>` guest boundary. Webview owners invoke this on focus so an open
 * host menu closes with the same semantics as a normal outside click.
 */
export function closeAllMenus() {
  closeAllListeners.forEach((fn) => fn());
}

/** Returns an unsubscribe function. */
export function subscribeMenuCloseAll(fn: () => void): () => void {
  closeAllListeners.add(fn);
  return () => closeAllListeners.delete(fn);
}

/** Close host menus whenever an embedded guest takes focus. */
export function bindMenuCloseOnFocus(target: EventTarget): () => void {
  const handleFocus = () => closeAllMenus();
  target.addEventListener("focus", handleFocus);
  return () => target.removeEventListener("focus", handleFocus);
}
