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
  ["Empty", createElement(ReactLib.Empty, { title: "空", description: "没有内容" }), h(VueLib.Empty, { title: "空" }, { description: () => "没有内容" })],
  [
    "Empty compact",
    createElement(ReactLib.Empty, { compact: true, title: "空" }),
    h(VueLib.Empty, { compact: true, title: "空" }),
  ],
  [
    "InlineActionLink",
    createElement(ReactLib.InlineActionLink, null, "查看"),
    h(VueLib.InlineActionLink, null, { default: () => "查看" }),
  ],
  [
    "OptionCard",
    createElement(ReactLib.OptionCard, { active: true }, "选项"),
    h(VueLib.OptionCard, { active: true }, { default: () => "选项" }),
  ],
  ["TypingDots", createElement(ReactLib.TypingDots, null), h(VueLib.TypingDots)],
  ["TypingDots tiny", createElement(ReactLib.TypingDots, { size: "tiny" }), h(VueLib.TypingDots, { size: "tiny" })],
  [
    "WorkingText",
    createElement(ReactLib.WorkingText, { active: true, tone: "accent" }, "处理中"),
    h(VueLib.WorkingText, { active: true, tone: "accent" }, { default: () => "处理中" }),
  ],
  ["SkeletonBlock", createElement(ReactLib.SkeletonBlock, { className: "h-3 w-10" }), h(VueLib.SkeletonBlock, { class: "h-3 w-10" })],
  [
    "Alert",
    createElement(ReactLib.Alert, { variant: "warning", title: "注意" }, "内容"),
    h(VueLib.Alert, { variant: "warning", title: "注意" }, { default: () => "内容" }),
  ],
  [
    "SegmentedControl",
    createElement(ReactLib.SegmentedControl, {
      options: [{ value: "a", label: "A" }, { value: "b", label: "B" }],
      value: "a",
      onChange: () => {},
    }),
    h(VueLib.SegmentedControl, { options: [{ value: "a", label: "A" }, { value: "b", label: "B" }], value: "a" }),
  ],
  [
    "CheckBox",
    createElement(ReactLib.CheckBox, { active: true }, "记住"),
    h(VueLib.CheckBox, { active: true }, { default: () => "记住" }),
  ],
  [
    "CheckBox square",
    createElement(ReactLib.CheckBox, { active: false, round: "md", desc: "说明" }, "方形"),
    h(VueLib.CheckBox, { active: false, round: "md" }, { default: () => "方形", desc: () => "说明" }),
  ],
  [
    "TextArea",
    createElement(ReactLib.TextArea, { defaultValue: "文本" }),
    h(VueLib.TextArea, { modelValue: "文本" }),
  ],
  [
    "ListRow",
    createElement(ReactLib.ListRow, { title: "行", isActive: true, meta: "12:00" }),
    h(VueLib.ListRow, { title: "行", isActive: true }, { meta: () => "12:00" }),
  ],
  ["Button primary", createElement(ReactLib.Button, { variant: "primary" }, "主要"), h(VueLib.Button, { variant: "primary" }, { default: () => "主要" })],
  ["Button icon", createElement(ReactLib.Button, { icon: createElement("svg") }), h(VueLib.Button, null, { icon: () => h("svg") })],
  [
    "Input",
    createElement(ReactLib.Input, { label: "名称", hint: "提示", defaultValue: "x" }),
    h(VueLib.Input, { label: "名称", hint: "提示", modelValue: "x" }),
  ],
  [
    "Input error",
    createElement(ReactLib.Input, { error: "必填" }),
    h(VueLib.Input, { error: "必填" }),
  ],
  ["ToggleSwitch", createElement(ReactLib.ToggleSwitch, { checked: true, onChange: () => {} }), h(VueLib.ToggleSwitch, { checked: true })],
  [
    "MenuItem",
    createElement(ReactLib.MenuItem, { active: true }, "菜单项"),
    h(VueLib.MenuItem, { active: true }, { default: () => "菜单项" }),
  ],
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
