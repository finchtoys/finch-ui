import { createRoot } from "react-dom/client";
import { createApp } from "vue";
import type { App } from "vue";
import type { ReactNode } from "react";
import { reactTrees } from "./current-trees";
import { baselineReactTrees } from "./baseline-trees";
import { vueTrees } from "./vue-trees";
import { scenarios } from "./registry";
import type { ScenarioDef } from "./registry";
import { sampleSpec } from "./metrics";
import type { Sample } from "./metrics";
import ButtonDriftControl from "../vue/ButtonDriftControl.vue";

/**
 * In-page harness. Runs both frameworks in the SAME document, one at a time,
 * and returns comparable measurements. Kept inside the page (instead of doing
 * assertions in the Node runner) so it can be re-run verbatim inside a real
 * Finch webview later.
 */

/**
 * "baseline" is the pre-refactor copy of the same React components (see
 * baseline-trees.tsx). It exists to answer one question: did extracting the
 * class strings change what React renders? Its diff against "react" is the
 * before/after evidence, and it shares every other part of the rig.
 */
export type Side = "react" | "vue" | "baseline";

export interface SideResult {
  samplesBefore: Record<string, Sample[]>;
  samplesAfter: Record<string, Sample[]>;
  behavior: Record<string, unknown>;
  leakedNodesAfterUnmount: number;
  unmountError: string | null;
}

interface DiffEntry {
  scenario: string;
  kind: "class" | "class-order" | "class-whitespace" | "style" | "geometry" | "behavior" | "missing" | "structure";
  key: string;
  react: unknown;
  vue: unknown;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const raf = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

let reactRoot: ReturnType<typeof createRoot> | null = null;
let vueApp: App | null = null;

function stage(): HTMLElement {
  return document.getElementById("stage") as HTMLElement;
}

function clearStage() {
  const el = stage();
  el.replaceChildren();
}

function purgeOrphans() {
  for (const node of [...document.body.children]) {
    const el = node as HTMLElement;
    if (el.id === "react-app" || el.id === "vue-app" || el.tagName === "SCRIPT") continue;
    if (el.hasAttribute("data-menu-panel") || el.hasAttribute("data-finch-modal-shell")) el.remove();
  }
}

async function mount(side: Side, id: string): Promise<() => Promise<void>> {
  clearStage();
  if (side === "react" || side === "baseline") {
    const source = side === "react" ? reactTrees : baselineReactTrees;
    const tree = source[id] as (() => ReactNode) | undefined;
    if (!tree) throw new Error(`no ${side} tree for ${id}`);
    const root = createRoot(stage());
    reactRoot = root;
    root.render(tree());
    return async () => {
      root.unmount();
      reactRoot = null;
    };
  }
  const tree = vueTrees[id];
  if (!tree) throw new Error(`no vue tree for ${id}`);
  const app = createApp({ render: () => tree() });
  vueApp = app;
  app.mount(stage());
  return async () => {
    app.unmount();
    vueApp = null;
  };
}

function countOrphans(): number {
  return document.body.querySelectorAll(":scope > [data-menu-panel], :scope > [data-finch-modal-shell]").length;
}

async function measure(
  side: Side,
  scenario: ScenarioDef,
  treeId = scenario.id,
): Promise<SideResult> {
  let unmount: (() => Promise<void>) | null = null;
  let unmountError: string | null = null;
  const samplesBefore: Record<string, Sample[]> = {};
  const samplesAfter: Record<string, Sample[]> = {};
  let behavior: Record<string, unknown> = {};

  try {
    unmount = await mount(side, scenario.treeId ?? treeId);
    await raf();
    await raf();
    await wait(scenario.settle ?? 260);
    await raf();

    for (const spec of scenario.samples) samplesBefore[spec.key] = sampleSpec(spec);

    if (scenario.script) {
      const ctx = {
        wait,
        raf,
        q: <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector),
        qa: <T extends Element = HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)],
        escape: () => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
        },
        pointerDownOn: (target: Element) => {
          target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
        },
        count: (selector: string) => document.querySelectorAll(selector).length,
      };
      behavior = await scenario.script(ctx);
      await raf();
      for (const spec of scenario.samples) samplesAfter[spec.key] = sampleSpec(spec);
    }
  } finally {
    if (unmount) {
      try {
        await unmount();
        await raf();
      } catch (error) {
        unmountError = String(error);
      }
    }
  }

  const leaked = countOrphans();
  purgeOrphans();

  return { samplesBefore, samplesAfter, behavior, leakedNodesAfterUnmount: leaked, unmountError };
}

const POSITION_TOLERANCE = 1;

function compareSample(scenario: string, key: string, react: Sample | undefined, vue: Sample | undefined, diffs: DiffEntry[]) {
  if (!react || !vue) {
    if (react || vue) diffs.push({ scenario, kind: "missing", key, react: react?.key ?? null, vue: vue?.key ?? null });
    return;
  }
  if (react.tag !== vue.tag) diffs.push({ scenario, kind: "structure", key, react: react.tag, vue: vue.tag });
  if (react.className !== vue.className) {
    const a = new Set(react.classTokens);
    const b = new Set(vue.classTokens);
    const onlyReact = [...a].filter((token) => !b.has(token));
    const onlyVue = [...b].filter((token) => !a.has(token));
    if (onlyReact.length || onlyVue.length) {
      diffs.push({ scenario, kind: "class", key, react: { onlyReact }, vue: { onlyVue } });
    } else if (react.classTokens.join(" ") === vue.classTokens.join(" ")) {
      // Same tokens, same order — only the whitespace between them differs.
      // Inert (classList is identical, no selector matches whitespace), but it
      // is still a byte difference and gets reported as such.
      diffs.push({ scenario, kind: "class-whitespace", key, react: react.className, vue: vue.className });
    } else {
      diffs.push({ scenario, kind: "class-order", key, react: react.className, vue: vue.className });
    }
  }
  for (const [prop, value] of Object.entries(react.style)) {
    const other = vue.style[prop];
    if (value !== other) diffs.push({ scenario, kind: "style", key: `${key}.${prop}`, react: value, vue: other });
  }
  for (const prop of ["x", "y", "width", "height"] as const) {
    if (Math.abs(react.rect[prop] - vue.rect[prop]) > POSITION_TOLERANCE) {
      diffs.push({ scenario, kind: "geometry", key: `${key}.rect.${prop}`, react: react.rect[prop], vue: vue.rect[prop] });
    }
  }
  for (const [name, value] of Object.entries(react.attrs)) {
    if (value !== vue.attrs[name]) diffs.push({ scenario, kind: "structure", key: `${key}.@${name}`, react: value, vue: vue.attrs[name] });
  }
}

function compareMaps(scenario: string, label: string, react: Record<string, Sample[]>, vue: Record<string, Sample[]>, diffs: DiffEntry[]) {
  const keys = new Set([...Object.keys(react), ...Object.keys(vue)]);
  for (const key of keys) {
    const a = react[key] ?? [];
    const b = vue[key] ?? [];
    if (a.length !== b.length) {
      diffs.push({ scenario, kind: "missing", key: `${label}:${key}`, react: a.length, vue: b.length });
      continue;
    }
    for (let index = 0; index < a.length; index += 1) {
      compareSample(scenario, `${label}:${a[index].key}`, a[index], b[index], diffs);
    }
  }
}

function compareBehavior(scenario: string, react: Record<string, unknown>, vue: Record<string, unknown>, diffs: DiffEntry[]) {
  const keys = new Set([...Object.keys(react), ...Object.keys(vue)]);
  for (const key of keys) {
    const a = react[key];
    const b = vue[key];
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    diffs.push({ scenario, kind: "behavior", key, react: a ?? null, vue: b ?? null });
  }
}

export interface ScenarioReport {
  id: string;
  group: string;
  title: string;
  react: SideResult;
  vue: SideResult;
  /** Pre-refactor React (before the class-string extraction). */
  baseline: SideResult;
  /** React (HEAD) vs Vue — the framework-parity diff. */
  diffs: DiffEntry[];
  /** React (HEAD) vs React (pre-refactor) — the extraction-safety diff. */
  refactorDiffs: DiffEntry[];
}

function diffSide(a: SideResult, b: SideResult, scenario: ScenarioDef): DiffEntry[] {
  const out: DiffEntry[] = [];
  compareMaps(scenario.id, "before", a.samplesBefore, b.samplesBefore, out);
  compareMaps(scenario.id, "after", a.samplesAfter, b.samplesAfter, out);
  compareBehavior(scenario.id, a.behavior, b.behavior, out);
  if (a.leakedNodesAfterUnmount !== b.leakedNodesAfterUnmount) {
    out.push({
      scenario: scenario.id,
      kind: "behavior",
      key: "leakedNodesAfterUnmount",
      react: a.leakedNodesAfterUnmount,
      vue: b.leakedNodesAfterUnmount,
    });
  }
  return out;
}

export async function runScenario(scenario: ScenarioDef): Promise<ScenarioReport> {
  const react = await measure("react", scenario);
  const vue = await measure("vue", scenario);
  const baseline = await measure("baseline", scenario);
  const diffs = diffSide(react, vue, scenario);
  const refactorDiffs = diffSide(baseline, react, scenario);
  return { id: scenario.id, group: scenario.group, title: scenario.title, react, vue, baseline, diffs, refactorDiffs };
}

/** Negative control: React original vs a Vue copy with one utility removed. */
export async function runControl(): Promise<{ diffs: DiffEntry[]; expectedStyleDiff: boolean }> {
  const scenario = scenarios.find((item) => item.id === "btn-primary") as ScenarioDef;
  const react = await measure("react", scenario);
  const vue: SideResult = { samplesBefore: {}, samplesAfter: {}, behavior: {}, leakedNodesAfterUnmount: 0, unmountError: null };

  clearStage();
  const app = createApp(ButtonDriftControl, { variant: "primary" });
  app.mount(stage());
  await raf();
  await raf();
  await wait(200);
  vue.samplesBefore.root = sampleSpec({ key: "root", selector: "#stage button" })[0]
    ? [sampleSpec({ key: "root", selector: "#stage button" })[0]]
    : [];
  app.unmount();
  await raf();
  purgeOrphans();

  const diffs: DiffEntry[] = [];
  compareMaps("control-button-drift", "before", react.samplesBefore, vue.samplesBefore, diffs);
  return { diffs, expectedStyleDiff: diffs.some((diff) => diff.key.includes("font-weight")) };
}

export interface SpikeReport {
  generatedAt: string;
  viewport: { width: number; height: number; dpr: number };
  theme: string;
  css: { href: string; bytes: number };
  reactVersion: string;
  vueVersion: string;
  scenarios: ScenarioReport[];
  control: { diffs: DiffEntry[]; expectedStyleDiff: boolean };
  /** True when every scenario renders identically before and after the extraction. */
  refactorIdentical: boolean;
  /** Same, ignoring whitespace-only class differences (semantic equivalence). */
  refactorSemanticallyIdentical: boolean;
}

export async function runAll(options: { theme?: "light" | "dark" } = {}): Promise<SpikeReport> {
  const theme = options.theme ?? "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.preview = theme;
  await raf();

  const reports: ScenarioReport[] = [];
  for (const scenario of scenarios) {
    reports.push(await runScenario(scenario));
  }
  const control = await runControl();

  const cssLink = [...document.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']")][0];
  let cssBytes = 0;
  try {
    cssBytes = (await (await fetch(cssLink.href)).text()).length;
  } catch {
    cssBytes = 0;
  }

  return {
    generatedAt: new Date().toISOString(),
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
    theme,
    css: { href: cssLink?.href ?? "", bytes: cssBytes },
    reactVersion: "react",
    vueVersion: "vue",
    scenarios: reports,
    control,
    refactorIdentical: reports.every((item) => item.refactorDiffs.length === 0),
    refactorSemanticallyIdentical: reports.every(
      (item) => item.refactorDiffs.every((diff) => diff.kind === "class-whitespace"),
    ),
  };
}

// ─── Probe API (real mouse/keyboard from Playwright) ────────────────────────

/** Mounts one side and leaves it mounted so the runner can drive real input. */
export async function mountForProbe(side: Side, id: string): Promise<void> {
  await unmountProbe();
  await mount(side, id);
  await raf();
  await raf();
  await wait(420);
  await raf();
}

export async function unmountProbe(): Promise<void> {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
  if (vueApp) {
    vueApp.unmount();
    vueApp = null;
  }
  clearStage();
  purgeOrphans();
  await raf();
}
