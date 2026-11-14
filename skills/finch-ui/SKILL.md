---
name: finch-ui
description: >-
  用 @finchtoys/ui 写 Finch 小程序（mini tool / mini program）的 Web 面板界面。
  当用户要给 Finch 小程序做 UI、做设置面板、做 App Panel 页面，或提到
  「让面板和 Finch 长得一样」「用 Finch 的组件」「用 Finch UI」「用 @finchtoys/ui」
  「小程序面板样式」「跟随 Finch 主题」「Finch 风格的按钮/输入框/弹窗」时务必使用；
  即使用户没有点名这个包，只要是在给 Finch 小程序写界面、想让界面跟随 Finch 主题，
  也应使用本 skill。它会告诉你组件怎么选、有哪些坑、以及哪些组件不能直接拿来用。
---

# 用 Finch UI 写小程序面板

`@finchtoys/ui` 是 Finch 主程序自己那套 React 组件的抽取版。用它而不是手写 HTML + `<style>`，
换来的是：**自动跟随用户的浅色/深色主题和自定义皮肤**，观感和 Finch 本体一致。

代价是小程序要引入 React 和构建步骤（Vite）。Finch 官方示例是零构建的纯 HTML，
所以这是「多一种做法」，不是默认做法 —— 先确认用户确实要这个方向。

## 上手三件套

```bash
npm i @finchtoys/ui react react-dom lucide-react
```

```tsx
import { Button, Input, ToggleSwitch, Badge } from "@finchtoys/ui";
import "@finchtoys/ui/style.css";   // 必须，样式全在这
```

三条硬性要求，漏一条就白屏或裸奔：

1. **必须引 `@finchtoys/ui/style.css`**。组件样式是预编译好的 CSS，**消费方不需要装 Tailwind**，
   也不要给项目加 Tailwind 插件去扫它 —— 会重复生成。
2. **React / ReactDOM 是 peerDependency**，由你的页面自己提供。**绝不能把 React 打进库**，
   页面里出现两份 React 会直接坏掉。
3. **`lucide-react` 也是 peerDependency**，组件内部用它出图标，要一起装。

## 主题：不用做事，但要知道边界

Finch 宿主会自动往小程序 webview 注入 `--finch-*` CSS 变量，组件读这些变量。
所以浅色/深色切换、用户在换肤工坊换自定义皮肤，**都自动跟随，你什么都不用写**。

需要主动读主题时（比如自己写点自定义样式），用 `var(--finch-accent, #0db664)` 这类
带 fallback 的写法。可用的是 `--finch-*` 前缀那批，**不是** `--bg-*` / `--text-*` 这些
Finch 内部名 —— 后者在 webview 里取不到值。

**边界（写自定义样式时容易踩）**：宿主只注入白名单内的 token。`--bg-inset`、`--danger-dim`、
`--text-inverse`、`--ease-*`、`--duration-*` 不在白名单里，取到的是空。别在自己的样式里
指望它们有值。

## 组件清单

**基础**：`Button` `ButtonGroup` `Badge` `Chip` `ActionChip` `Kbd` `Alert` `Empty`
`OptionCard` `SkeletonBlock` `TypingDots` `WorkingText` `Breadcrumb` `IconTabBar` `ListRow`
`InlineActionLink` `Emoji` `EmojiText`

**表单**：`Input` `TextArea` `SecretInput` `SearchField` `CheckBox` `ToggleSwitch`
`SegmentedControl` `StepSlider` `TimePicker` `DropdownSelect` `InlineSelect`
`MultiSelect` `InputSelect`

**浮层**：`Tooltip` `HoverCard` `Menu` `ModalShell` `ConfirmDialog` `DialogMessage` `Toast`
`ScrollArea`

## 这些坑必须避开

| 组件 | 坑 | 怎么做 |
|---|---|---|
| `Toast` | 全局单例，且液态玻璃背景依赖宿主 SVG filter，在小程序里退化为普通背景 | 每个页面自己挂 `ToastViewport` 并注册，别跨页面共享 |
| `DropdownSelect` | **默认不走 portal**，放进滚动容器会被裁切 | 在可滚动容器里一定要显式传 `portal` |
| `Emoji` / `EmojiText` | 靠 Vite `import.meta.glob` 内联 561 个 Twemoji SVG，约 1.2 MB | 非 Vite 项目**不要用**；只要 emoji 显示就直接用文本 |
| `Tooltip` / `HoverCard` | 反色底是硬编码色，不跟随自定义皮肤色相 | 能接受就用；在意色相一致性就自己实现 |
| 所有浮层 | portal 容器是 webview 自己的 `document.body` | 浮层**不可能越出小程序面板边界**，靠边缘会被 clamp 在面板内，设计时留出空间 |
| `ModalShell` | 设置类变体的样式来自宿主 CSS，已随包复制 | 用普通变体最稳 |

## 写面板时的默认选择

- 页面根节点用 `className="p-4 flex flex-col gap-3"` 这类布局，Finch 面板就是这个节奏。
- 主操作 `variant="primary"`，次要操作用默认，危险操作用 danger 变体 —— **不要自己写颜色**。
- 需要「正在忙」的文案用 `WorkingText` / `TypingDots`，别自己写省略号动画。
- 空状态用 `Empty`，加载占位用 `SkeletonBlock`。
- 确认类交互用 `ConfirmDialog`，别用 `window.confirm`。

## 想看组件长什么样

仓库里的 `lab/` 是 **Finch UI Lab** 小程序，把全部组件的所有状态变体都摆在真实 webview 里，
顶部能当场切主题核对跟随效果。要判断某个组件合不合适、或者怀疑自己用错了，
先让它跑起来看，比猜快得多。

```bash
cd lab && npm install && npm run build
npx @finchtoys/minitools install .
```

## 不要做的事

- 不要为了「更好看」去覆盖组件的圆角、间距、配色 —— 那会立刻破坏「和 Finch 一致」这个唯一目的。
- 不要引 Tailwind 再自己写 utility 去补组件缺的东西；缺什么先去看组件清单里有没有现成的。
- 不要把 `@finchtoys/ui` 和手写的另一套按钮/输入框混在一个面板里，视觉会打架。
