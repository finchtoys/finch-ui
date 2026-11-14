# @finchtoys/ui-vue

Finch's built-in components for **Vue 3**. Same class strings, same stylesheet, same behaviour as
[`@finchtoys/ui`](../..) — a panel written in Vue looks like Finch itself, without a second design system.

```bash
npm i @finchtoys/ui-vue vue
```

```ts
import "@finchtoys/ui/style.css";      // the ONE stylesheet — nothing is recompiled for Vue
import { Button, Input, ToggleSwitch } from "@finchtoys/ui-vue";
```

The stylesheet is `@finchtoys/ui`'s prebuilt `dist/style.css`. Do not build Tailwind yourself: every
class this package puts on the page already has a rule there. Because colours/sizes come from the
`--ui-*` / `--finch-*` custom properties, light / dark / custom skins keep working unchanged.

## 提供什么

Everything in this list is exported from the package root (`import { X } from "@finchtoys/ui-vue"`).

| 分组 | 组件 |
|---|---|
| 展示 | `Badge` `FreeModelBadge` `Chip`(=`ActionChip`，`actionable`) `Kbd` `Empty` `InlineActionLink` `OptionCard` `Alert` `ListRow` `TypingDots` `WorkingText` `SkeletonBlock` `SkeletonCatalogCard` `SkeletonCatalogGrid` `DialogMessage` |
| 表单 | `Button` `ButtonGroup` `Input` `TextArea` `SecretInput` `CheckBox` `ToggleSwitch` `SegmentedControl` `SearchField` `StepSlider` `InputSelect` |
| 选择器 | `InlineSelect` `DropdownSelect` `MultiSelect` `TimePicker` |
| 导航 | `Breadcrumb` `IconTabBar` |
| 浮层 | `Tooltip` `HoverCard` `MenuPopover` `MenuItem` `MenuSubmenu` `ModalShell` `ConfirmDialog` |
| 滚动 | `ScrollArea` |

Also re-exported: `closeAllMenus` / `isAnyMenuOpen` / `bindMenuCloseOnFocus` / `subscribeMenuState` /
`subscribeMenuCloseAll` (the same menu-state singleton the React build uses — plain TS, no React).

Props follow the React API, with two idiomatic translations:

- **Node props → slots.** `leadingIcon` / `trailingIcon` / `icon` / `headerRight` / `endAdornment` /
  `desc` / `marker` / `meta` / `float` / `content` are named slots (`#leading`, `#trailing`, `#icon`,
  `#headerRight`, `#endAdornment`, `#desc`, `#marker`, `#meta`, `#float`, `#content`). A slot only
  renders when the caller passes it — that is the Vue equivalent of "prop not set".
- **`className` → `class`.** Everywhere React appends `className`, pass `class="…"`; Vue merges it
  after the component's own classes, exactly where React puts it. Vue then also renders it verbatim.
- **Controlled inputs → `v-model`.** `Input`, `TextArea`, `SecretInput` use `modelValue` +
  `update:modelValue`; `MultiSelect` uses `modelValue: string[]`; `DropdownSelect` / `InlineSelect` /
  `TimePicker` / `SegmentedControl` / `StepSlider` / `CheckBox` / `ToggleSwitch` emit `change` (and
  `CheckBox` also `toggle`) — same as the React callbacks, just as events.

## 暂不提供 / 有降级

| 项 | 状态 | 原因 |
|---|---|---|
| `Emoji` / `EmojiText` | **不提供** | React 版依赖 Vite 专有的 `import.meta.glob` 内联 561 个 Twemoji SVG（约 1.2 MB）。Vue 消费者不一定是 Vite；要提供就得先设计一套资产出口（独立入口或按需 URL），本轮不做。`ListRow` 的 `title` 因此按纯文本渲染，不替换 emoji。 |
| `LiquidGlassFilter` | **不提供** | 它是宿主（Finch 主窗口）的液态玻璃 SVG filter 单例，不属于通用组件；`Toast` 的玻璃背景依赖它。 |
| `Toast` | **不提供** | 依赖 `registerToastApi` 全局单例 + 上面的玻璃滤镜；小程序 webview 里会退化成普通背景。宿主自己的 `window.finch.ui.toast` 已能覆盖大部分场景。 |
| `ScrollArea` | **降级** | Vue 版是原生滚动容器 + scroll 驱动的 mask 渐变；没有搬 React 版的 `ResizeObserver`/rAF 循环与横向模式。目前调用点（弹层、对话框）都只用纵向。 |
| `DropdownSelect` / `MultiSelect` | **降级** | 选项列表用原生滚动容器，没有 `ScrollArea` 的上下边缘渐变。 |
| `ButtonGroup` | **限制** | 用 `cloneVNode` 注入组样式（等价 React 的 `cloneElement`），但不会像 React 那样把 `<Tooltip><Button/></Tooltip>` 拆开再包回去。请把 Tooltip 放进组内而不是包住整个组项。 |
| `Tooltip` / `HoverCard` | **实现差异** | React 用 `cloneElement` 给触发器挂事件；Vue 在触发器外包一层 `display:contents` 的 span 并测量它的第一个元素子节点。布局与 class 不受影响，但触发器必须是单个元素。 |
| `SegmentedControl` | **限制** | `options[].icon` 收的是图标 key（字符串）而不是节点——数据驱动的选项列表里没法传 slot。 |
| SSR | **不支持** | 与 React 版一致：浮层用 `Teleport`/`createPortal`，定位依赖 `window`。 |

## 和 React 版的关系

- **class 字符串单一来源**：两边都从 `library/styles/classes.ts` 取值（React 直接 import，Vue 在构建时内联）。仓库里的 `verify-build.mjs` 会强制「已迁移组件不得再内联 class 字面量」，并检查每个 utility 在 `dist/style.css` 里确有规则。
- 不改样式：本包不产出 CSS。样式永远来自 `@finchtoys/ui/style.css`。
- `vue` 是 peer 依赖（不会给你第二份 Vue）；`@finchtoys/ui` 是可选 peer，只为了那份 CSS。

## 开发

```bash
npm run build      # 图标数据生成 → vite lib build → vue-tsc 输出 d.ts
npm run typecheck
npm run smoke      # 最小冒烟：每个组件渲染不抛错 + class token 与 React 一致
```

`smoke` 用 `renderToString` 分别渲染 React 与 Vue 两版，比对每个元素的 class 集合。它不是
spike 里那套逐属性/逐像素 harness —— 那套是用来证明路线可行的，这里只要「没在搬的过程中悄悄
改坏」。
