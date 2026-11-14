/**
 * Minimal smoke: every ported component must render without throwing, and the
 * set of classes it puts on the page must match the React component it mirrors.
 *
 * Deliberately NOT the spike harness: no computed styles, no pixels, no a11y
 * tree. Those proved the route was viable; this keeps the route from silently
 * breaking while components are ported.
 *
 *   node scripts/smoke.mjs
 */
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import * as VueLib from "../dist/index.js";
import * as ReactLib from "../../../library/dist/index.js";

/** class="a b c" → ["a","b","c"], sorted, per class attribute occurrence. */
function classTokens(html) {
  const out = [];
  for (const match of html.matchAll(/class="([^"]*)"/g)) {
    out.push(match[1].split(/\s+/).filter(Boolean).sort().join(" "));
  }
  return out.sort();
}

function diffMultiset(a, b) {
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of b) counts.set(item, (counts.get(item) ?? 0) - 1);
  const onlyReact = [];
  const onlyVue = [];
  for (const [item, count] of counts) {
    if (count > 0) onlyReact.push(`${item} ×${count}`);
    if (count < 0) onlyVue.push(`${item} ×${-count}`);
  }
  return { onlyReact, onlyVue };
}

/** [name, react element, vue vnode] */
const CASES = [
  ["Badge default", createElement(ReactLib.Badge, null, "Beta"), h(VueLib.Badge, null, { default: () => "Beta" })],
  [
    "Badge success md",
    createElement(ReactLib.Badge, { variant: "success", size: "md" }, "OK"),
    h(VueLib.Badge, { variant: "success", size: "md" }, { default: () => "OK" }),
  ],
  [
    "FreeModelBadge",
    createElement(ReactLib.FreeModelBadge, { isFree: true }),
    h(VueLib.FreeModelBadge, { isFree: true }),
  ],
  ["Chip", createElement(ReactLib.Chip, null, "标签"), h(VueLib.Chip, null, { default: () => "标签" })],
  [
    "Chip removable",
    createElement(ReactLib.Chip, { onRemove: () => {} }, "可删"),
    h(VueLib.Chip, null, { default: () => "可删", remove: () => null }),
  ],
  ["ActionChip", createElement(ReactLib.ActionChip, null, "动作"), h(VueLib.Chip, { actionable: true }, { default: () => "动作" })],
  ["Kbd", createElement(ReactLib.Kbd, null, "⌘B"), h(VueLib.Kbd, null, { default: () => "⌘B" })],
  ["Kbd plain", createElement(ReactLib.Kbd, null, "Enter"), h(VueLib.Kbd, null, { default: () => "Enter" })],
];

let failures = 0;
for (const [name, reactNode, vueNode] of CASES) {
  let reactHtml = "";
  let vueHtml = "";
  try {
    reactHtml = renderToStaticMarkup(reactNode);
  } catch (error) {
    failures += 1;
    console.log(`FAIL  ${name} — React threw: ${error.message}`);
    continue;
  }
  try {
    vueHtml = await renderToString(createSSRApp({ render: () => vueNode }));
  } catch (error) {
    failures += 1;
    console.log(`FAIL  ${name} — Vue threw: ${error.message}`);
    continue;
  }
  const { onlyReact, onlyVue } = diffMultiset(classTokens(reactHtml), classTokens(vueHtml));
  if (onlyReact.length || onlyVue.length) {
    failures += 1;
    console.log(`FAIL  ${name}`);
    if (onlyReact.length) console.log(`      only in React: ${onlyReact.join(" | ")}`);
    if (onlyVue.length) console.log(`      only in Vue:   ${onlyVue.join(" | ")}`);
  } else {
    console.log(`ok    ${name}`);
  }
}

console.log(
  failures === 0
    ? `\nSMOKE PASS: ${CASES.length} cases, classes match React.`
    : `\nSMOKE FAIL: ${failures} of ${CASES.length} cases.`,
);
process.exit(failures === 0 ? 0 : 1);
