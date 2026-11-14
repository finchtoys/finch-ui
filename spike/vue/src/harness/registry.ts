import type { SampleSpec } from "./metrics";

export interface Ctx {
  wait: (ms: number) => Promise<void>;
  raf: () => Promise<void>;
  q: <T extends Element = HTMLElement>(selector: string) => T | null;
  qa: <T extends Element = HTMLElement>(selector: string) => T[];
  escape: () => void;
  pointerDownOn: (target: Element) => void;
  count: (selector: string) => number;
}

export interface ScenarioDef {
  id: string;
  group: "button" | "input" | "toggle" | "modal" | "menu" | "overlay";
  title: string;
  /** Reuse the tree of another scenario when only the interaction differs. */
  treeId?: string;
  /**
   * Deliberately drifted control: the run MUST report diffs here. It is how the
   * harness proves it can still see drift instead of silently comparing equal
   * things.
   */
  sensitivity?: boolean;
  /** How long to let entry animations finish before sampling. */
  settle?: number;
  samples: SampleSpec[];
  /** Runs after the first sample pass; returns comparable behavior facts. */
  script?: (ctx: Ctx) => Promise<Record<string, unknown>>;
}

const rect = (el: Element | null) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x * 100) / 100, y: Math.round(r.y * 100) / 100, width: Math.round(r.width * 100) / 100, height: Math.round(r.height * 100) / 100 };
};

const PANEL = "body > [data-menu-panel]";
const MODAL = "[data-finch-modal-shell]";

export const scenarios: ScenarioDef[] = [
  // ── Button ────────────────────────────────────────────────────────────────
  { id: "btn-primary", group: "button", title: "Button primary/md", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-brand", group: "button", title: "Button brand/md", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-secondary", group: "button", title: "Button secondary/md", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-ghost", group: "button", title: "Button ghost/md", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-outline", group: "button", title: "Button outline/md", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-danger", group: "button", title: "Button danger/md", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-link", group: "button", title: "Button link/md", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-secondary-sm", group: "button", title: "Button secondary/sm", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-secondary-lg", group: "button", title: "Button secondary/lg", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-round-md", group: "button", title: "Button round=md", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-round-full", group: "button", title: "Button round=full", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-icon-ghost", group: "button", title: "Button icon ghost", samples: [{ key: "root", selector: "#stage button" }, { key: "icon", selector: "#stage button svg" }] },
  { id: "btn-icon-primary", group: "button", title: "Button icon primary", samples: [{ key: "root", selector: "#stage button" }, { key: "icon", selector: "#stage button svg" }] },
  { id: "btn-icon-danger", group: "button", title: "Button icon danger", samples: [{ key: "root", selector: "#stage button" }, { key: "icon", selector: "#stage button svg" }] },
  { id: "btn-pressed", group: "button", title: "Button pressed", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-disabled", group: "button", title: "Button disabled", samples: [{ key: "root", selector: "#stage button" }] },
  { id: "btn-span", group: "button", title: "Button as=span disabled", samples: [{ key: "root", selector: "#stage span[role='button']" }] },
  { id: "btn-with-icons", group: "button", title: "Button leading+trailing icons", samples: [{ key: "root", selector: "#stage button" }] },

  // ── Input ─────────────────────────────────────────────────────────────────
  { id: "input-default", group: "input", title: "Input default + label + hint", samples: [{ key: "label", selector: "#stage label" }, { key: "parts", selector: "#stage label > span" }, { key: "input", selector: "#stage input" }] },
  { id: "input-error", group: "input", title: "Input error", samples: [{ key: "label", selector: "#stage label" }, { key: "parts", selector: "#stage label > span" }, { key: "input", selector: "#stage input" }] },
  { id: "input-ghost", group: "input", title: "Input ghost", samples: [{ key: "input", selector: "#stage input" }] },
  { id: "input-plain", group: "input", title: "Input plain", samples: [{ key: "input", selector: "#stage input" }] },
  { id: "input-mono-sm", group: "input", title: "Input mono/sm", samples: [{ key: "input", selector: "#stage input" }] },
  { id: "input-lg", group: "input", title: "Input lg/lg round + label", samples: [{ key: "input", selector: "#stage input" }, { key: "parts", selector: "#stage label > span" }] },
  { id: "input-adornment", group: "input", title: "Input endAdornment", samples: [{ key: "input", selector: "#stage input" }, { key: "parts", selector: "#stage label > span" }] },

  // ── ToggleSwitch ──────────────────────────────────────────────────────────
  { id: "toggle-off", group: "toggle", title: "Toggle off", samples: [{ key: "root", selector: "#stage button" }, { key: "thumb", selector: "#stage button > span" }] },
  { id: "toggle-on", group: "toggle", title: "Toggle on", samples: [{ key: "root", selector: "#stage button" }, { key: "thumb", selector: "#stage button > span" }] },
  { id: "toggle-sm-on", group: "toggle", title: "Toggle sm on", samples: [{ key: "root", selector: "#stage button" }, { key: "thumb", selector: "#stage button > span" }] },
  { id: "toggle-disabled", group: "toggle", title: "Toggle disabled", samples: [{ key: "root", selector: "#stage button" }, { key: "thumb", selector: "#stage button > span" }] },

  // ── ModalShell ────────────────────────────────────────────────────────────
  {
    id: "modal-default",
    group: "modal",
    title: "ModalShell default",
    settle: 520,
    samples: [
      { key: "backdrop", selector: `${MODAL}` },
      { key: "shell", selector: `${MODAL} > div` },
      { key: "title", selector: `${MODAL} h2` },
      { key: "close", selector: `${MODAL} button` },
      { key: "closeIcon", selector: `${MODAL} button svg` },
      { key: "body", selector: `${MODAL} p` },
    ],
    script: async ({ q, count, pointerDownOn }) => {
      const before = count(MODAL);
      // Default closeOnBackdrop=false → clicking the backdrop must NOT close.
      const backdrop = q(MODAL);
      if (backdrop) backdrop.click();
      await new Promise((r) => setTimeout(r, 80));
      return {
        shellsBefore: before,
        shellsAfterBackdropClick: count(MODAL),
        activeElementTag: document.activeElement?.tagName.toLowerCase() ?? null,
        _unused: typeof pointerDownOn,
      };
    },
  },
  {
    id: "modal-noheader",
    group: "modal",
    title: "ModalShell noHeader",
    settle: 520,
    samples: [{ key: "shell", selector: `${MODAL} > div` }, { key: "body", selector: `${MODAL} p` }],
  },
  {
    id: "modal-header-right",
    group: "modal",
    title: "ModalShell title + headerRight",
    settle: 520,
    samples: [
      { key: "shell", selector: `${MODAL} > div` },
      { key: "title", selector: `${MODAL} h2` },
      { key: "headerRightText", selector: `${MODAL} span.text-\\[12px\\]` },
    ],
  },
  {
    id: "modal-close-on-backdrop",
    group: "modal",
    title: "ModalShell closeOnBackdrop",
    settle: 520,
    samples: [{ key: "backdrop", selector: MODAL }],
    script: async ({ q, count }) => {
      const backdrop = q(MODAL);
      backdrop?.click();
      await new Promise((r) => setTimeout(r, 80));
      return { shellsAfterBackdropClick: count(MODAL) };
    },
  },
  {
    id: "modal-nested",
    group: "modal",
    title: "ModalShell nested + Esc",
    settle: 520,
    samples: [
      { key: "backdrops", selector: MODAL },
      { key: "shells", selector: `${MODAL} > div` },
    ],
    script: async ({ escape, wait, count, qa }) => {
      const before = count(MODAL);
      escape();
      await wait(80);
      const afterOne = count(MODAL);
      const remaining = qa(`${MODAL} > div[aria-modal='true']`).map((el) => el.getAttribute("aria-label"));
      escape();
      await wait(80);
      return { shellsBefore: before, shellsAfterOneEsc: afterOne, remainingLabels: remaining, shellsAfterTwoEsc: count(MODAL) };
    },
  },

  // ── Menu ──────────────────────────────────────────────────────────────────
  {
    id: "menu-bottom-start",
    group: "menu",
    title: "Menu bottom-start + portal 逃逸",
    settle: 420,
    samples: [
      { key: "panel", selector: PANEL },
      { key: "items", selector: `${PANEL} > button` },
      { key: "separator", selector: `${PANEL} > div` },
      { key: "icon", selector: `${PANEL} svg` },
      { key: "anchor", selector: "#anchor" },
    ],
    script: async ({ q }) => {
      const panel = q(PANEL);
      const anchor = q("#anchor");
      if (!panel || !anchor) return { panelPresent: false };
      const r = panel.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + Math.min(12, r.width / 2), r.y + Math.min(12, r.height / 2));
      return {
        panelPresent: true,
        portalParentIsBody: panel.parentElement === document.body,
        positionFixed: getComputedStyle(panel).position === "fixed",
        escapesOverflowClip: Boolean(hit && panel.contains(hit)),
        hitTag: hit?.tagName ?? null,
        panelRect: rect(panel),
        anchorRect: rect(anchor),
        relativeY: Math.round((r.y - anchor.getBoundingClientRect().y) * 100) / 100,
      };
    },
  },
  {
    id: "menu-scroll-follow",
    group: "menu",
    title: "Menu 跟随嵌套滚动",
    treeId: "menu-bottom-start",
    settle: 420,
    samples: [{ key: "panel", selector: PANEL }],
    script: async ({ q, wait }) => {
      const panel = q(PANEL);
      const anchor = q("#anchor");
      const scroller = q("#scroller");
      if (!panel || !anchor || !scroller) return { panelPresent: false };
      const before = panel.getBoundingClientRect().y - anchor.getBoundingClientRect().y;
      const anchorBefore = anchor.getBoundingClientRect().y;
      scroller.scrollTop = 20;
      await wait(140);
      const after = panel.getBoundingClientRect().y - anchor.getBoundingClientRect().y;
      const anchorAfter = anchor.getBoundingClientRect().y;
      return {
        panelPresent: true,
        relativeBefore: Math.round(before * 100) / 100,
        relativeAfter: Math.round(after * 100) / 100,
        anchorMoved: Math.round((anchorBefore - anchorAfter) * 100) / 100,
        followsAnchor: Math.abs(before - after) < 2,
      };
    },
  },
  {
    id: "menu-top-flip",
    group: "menu",
    title: "Menu 底部空间不足 → 向上翻转",
    settle: 420,
    samples: [{ key: "panel", selector: PANEL }, { key: "anchor", selector: "#anchor" }],
    script: async ({ q }) => {
      const panel = q(PANEL);
      const anchor = q("#anchor");
      if (!panel || !anchor) return { panelPresent: false };
      const p = panel.getBoundingClientRect();
      const a = anchor.getBoundingClientRect();
      return { panelPresent: true, placedAboveAnchor: p.bottom <= a.top + 1, panelRect: rect(panel), anchorRect: rect(anchor) };
    },
  },
  {
    id: "menu-right-start",
    group: "menu",
    title: "Menu right-start",
    settle: 420,
    samples: [{ key: "panel", selector: PANEL }, { key: "anchor", selector: "#anchor" }],
    script: async ({ q }) => {
      const panel = q(PANEL);
      const anchor = q("#anchor");
      if (!panel || !anchor) return { panelPresent: false };
      return {
        panelPresent: true,
        toTheRight: panel.getBoundingClientRect().left >= anchor.getBoundingClientRect().right - 1,
        panelRect: rect(panel),
        anchorRect: rect(anchor),
      };
    },
  },
  {
    id: "menu-anchor-point",
    group: "menu",
    title: "Menu anchorPoint + 滚动即关闭",
    settle: 420,
    samples: [{ key: "panel", selector: PANEL }],
    script: async ({ q, wait, count }) => {
      const panel = q(PANEL);
      if (!panel) return { panelPresent: false };
      const before = rect(panel);
      const scroller = q("#scroller");
      if (scroller) scroller.scrollTop = 20;
      await wait(180);
      return { panelPresent: true, beforeRect: before, panelsAfterScroll: count(PANEL) };
    },
  },
  {
    id: "menu-outside-click",
    group: "menu",
    title: "Menu 外部点击关闭",
    treeId: "menu-bottom-start",
    settle: 420,
    samples: [{ key: "panel", selector: PANEL }],
    script: async ({ pointerDownOn, wait, count, q }) => {
      const target = q("#stage") ?? document.body;
      pointerDownOn(target);
      // 120ms close animation: sample only after the panel is gone, otherwise
      // the two sides differ by whichever frame the animation happened to be on.
      await wait(240);
      return { panelsBefore: 1, panelsAfterOutsidePointerDown: count(PANEL) };
    },
  },

  // ── Overlays (stage 2) ────────────────────────────────────────────────────
  {
    id: "tooltip-controlled",
    group: "overlay",
    title: "Tooltip 受控定位",
    settle: 420,
    samples: [
      { key: "tip", selector: "body > .tooltip" },
      { key: "content", selector: "body > .tooltip > .tooltip__content" },
    ],
  },
  {
    id: "tooltip-hover",
    group: "overlay",
    title: "Tooltip 悬停出现 / 滚动关闭",
    settle: 320,
    samples: [{ key: "tip", selector: "body > .tooltip" }],
    script: async ({ q, wait, count }) => {
      const anchor = q("#tip-anchor");
      if (!anchor) return { anchorPresent: false };
      anchor.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, relatedTarget: document.body }));
      await wait(450);
      const opened = count("body > .tooltip");
      const openRect = opened ? rect(q("body > .tooltip")) : null;
      window.dispatchEvent(new Event("scroll"));
      await wait(300);
      return { anchorPresent: true, openedAfterHover: opened, rectOnOpen: openRect, remainingAfterScroll: count("body > .tooltip") };
    },
  },
  {
    id: "hovercard-controlled",
    group: "overlay",
    title: "HoverCard 受控定位",
    settle: 420,
    samples: [
      { key: "card", selector: "body > .hoverCard" },
      { key: "content", selector: "body > .hoverCard > .hoverCard__content" },
    ],
    script: async ({ q }) => {
      const card = q("body > .hoverCard");
      const trigger = q("#hc-trigger");
      if (!card || !trigger) return { cardPresent: false };
      const c = card.getBoundingClientRect();
      const t = trigger.getBoundingClientRect();
      return {
        cardPresent: true,
        cardRect: rect(card),
        triggerRect: rect(trigger),
        belowTrigger: c.top >= t.bottom - 1,
        horizontallyCentered: Math.abs(c.left + c.width / 2 - (t.left + t.width / 2)) < 2,
      };
    },
  },
  {
    id: "menusubmenu-right",
    group: "overlay",
    title: "MenuSubmenu 右侧展开",
    settle: 420,
    samples: [
      { key: "panel", selector: "body > [data-menu-submenu='true']" },
      { key: "items", selector: "body > [data-menu-submenu='true'] > button" },
    ],
    script: async ({ q }) => {
      const panel = q("body > [data-menu-submenu='true']");
      const trigger = q("#submenu-trigger");
      if (!panel || !trigger) return { panelPresent: false };
      const p = panel.getBoundingClientRect();
      const t = trigger.getBoundingClientRect();
      return { panelPresent: true, panelRect: rect(panel), triggerRect: rect(trigger), opensToTheRight: p.left >= t.right - 1 };
    },
  },
  {
    id: "confirm-open",
    group: "overlay",
    title: "ConfirmDialog 结构与 Esc",
    settle: 520,
    samples: [
      { key: "backdrop", selector: "[data-finch-modal-shell]" },
      { key: "shell", selector: "[data-finch-modal-shell] > div[role='alertdialog']" },
      { key: "close", selector: "[data-finch-modal-shell] > div > button" },
      { key: "title", selector: "[data-finch-modal-shell] p" },
      { key: "buttons", selector: "[data-finch-modal-shell] > div > div > button" },
    ],
    script: async ({ escape, wait, count }) => {
      const before = count("[data-finch-modal-shell]");
      escape();
      await wait(120);
      return { shellsBefore: before, shellsAfterEscape: count("[data-finch-modal-shell]") };
    },
  },
  {
    id: "control-tooltip-offset",
    group: "overlay",
    title: "负向对照：气泡下移 8px（必须被抓到）",
    settle: 420,
    sensitivity: true,
    samples: [
      { key: "tip", selector: "body > .tooltip" },
      { key: "content", selector: "body > .tooltip > .tooltip__content" },
    ],
  },
  {
    id: "menu-escape",
    group: "menu",
    title: "Menu Esc 关闭",
    treeId: "menu-bottom-start",
    settle: 420,
    samples: [{ key: "panel", selector: PANEL }],
    script: async ({ escape, wait, count }) => {
      escape();
      await wait(160);
      return { panelsAfterEscape: count(PANEL) };
    },
  },
];
