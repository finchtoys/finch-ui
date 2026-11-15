# Finch UI

Finch 内置的那套组件，抽出来给小程序（mini tool / mini program）作者用 —— 做出来的面板和 Finch 本身长得一样，跟着用户的主题和自定义皮肤一起变。

**React 和 Vue 两个版本，视觉完全一致**：同一份 class 源、同一份预编译 CSS，逐属性实测对齐，不是「看着差不多」。

| 包 | 框架 | 组件数 | 样式来自 |
|---|---|---|---|
| `@finchtoys/ui` | React 18/19 | 44 | `@finchtoys/ui/style.css` |
| `@finchtoys/ui-vue` | Vue 3 | 40 | **同样是 `@finchtoys/ui/style.css`** |

> **这套组件库是给 Finch 小程序（mini tool / mini program）的面板用的**，不是通用 UI 库。
> 它读的是 Finch 宿主注入的主题变量 —— 在 Finch 里自动跟随主题与自定义皮肤，脱离 Finch 只能拿到内置默认主题。
> 小程序怎么开发、怎么发布到社区，见 **[finchtoys/finch-releases](https://github.com/finchtoys/finch-releases)**。

> **CSS 只有一份。** Vue 包自己不产样式，用 Vue 也要装 `@finchtoys/ui` 并引它的 `style.css`。
> 两个包都**不需要你装 Tailwind** —— 样式已预编译。

## 选哪个

- 你的面板已经是 React，或者要用到 `Emoji` / `Toast` → **React 版**。
- 你想让面板体积小、依赖少（Vue 版运行时约 40 KB gzip，无 CSS 重编）→ **Vue 版**。
- 只要 emoji 正常显示就用文本，不必为它上 React 版。

---

## React 用法

```bash
npm i @finchtoys/ui react react-dom lucide-react
```

```tsx
import { Button, Input, ToggleSwitch } from "@finchtoys/ui";
import "@finchtoys/ui/style.css";

export function Panel() {
  const [name, setName] = useState("");
  return (
    <div className="p-4 flex flex-col gap-3">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="搜索" />
      <Button variant="primary">保存</Button>
      <ToggleSwitch checked aria-label="启用" />
    </div>
  );
}
```

三条硬性要求，漏一条就白屏或裸奔：

1. **必须引 `@finchtoys/ui/style.css`**，样式全在里面。
2. **React / ReactDOM 是 peerDependency**，由你的页面提供。**绝不能把 React 打进库**，页面里出现两份 React 会直接坏掉。
3. **`lucide-react` 也是 peerDependency**，组件内部用它出图标。

## Vue 用法

```bash
npm i vue @finchtoys/ui @finchtoys/ui-vue
```

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button, Input, ToggleSwitch } from "@finchtoys/ui-vue";
import "@finchtoys/ui/style.css";   // 样式在 @finchtoys/ui 里，不是 ui-vue

const name = ref("");
const on = ref(true);
</script>

<template>
  <div class="p-4 flex flex-col gap-3">
    <Input v-model="name" placeholder="搜索" />
    <Button variant="primary">保存</Button>
    <ToggleSwitch :checked="on" @change="on = !on" />
  </div>
</template>
```

Vue 版**零运行时依赖**（只 peer `vue`），不依赖 React，也不重复打包组件逻辑。

### 两边 API 对不上手的地方

| | React | Vue |
|---|---|---|
| 文本输入 | `value` + `onChange` | **`v-model`** |
| 开关 | `checked` + `onChange` | `:checked` + **`@change`**（没有 `v-model`） |
| 下拉选择 | `value` + `onChange` | `:value` + `:options` + **`@change`** |
| 子内容 | `children` | 默认插槽 |
| 图标 | 传元素：`icon={<Search size={14}/>}` | 传**组件**，且要把名字绑进去：`icon: tabIcon("search")` |
| class | `className` | `class`（也接受 `className`） |

### Vue 版不提供 / 有降级

- **不提供**：`Emoji`、`EmojiText`（依赖 Vite 资产管线）、`LiquidGlassFilter`、`Toast`（全局单例 + 玻璃滤镜）。
- **降级**：`ScrollArea` 用原生滚动，没有边缘渐变；`DropdownSelect` / `MultiSelect` 的选项列表同理。
- **DOM 多一层**：`ButtonGroup` / `Tooltip` 靠 `cloneVNode` + `display:contents` 包一层，行为等价但 DOM 比 React 多一个 wrap —— 别照 React 的结构写选择器。

写 Vue 前建议先扫一眼 skill 里的「Vue 专属的坑」表：那 8 条（布尔 prop 被强转、`watch` 创建时不执行、数字 style 不补 `px`、模板 ref 在组件上拿 `$el`、`pointerdown` 早于 `click`、slot 恒渲染、`LucideIcon` 表外名字静默空 svg、HTML 属性不做 JS 转义）每一条都是真实踩出来的，SSR 冒烟基本看不见，只有浏览器里才暴露。

---

## 先看看组件长什么样（装预览小程序）

写代码之前先装 **Finch UI Lab** —— 它是本仓库自带的预览小程序，把 React 版 44 个、Vue 版 40 个组件的**全部状态与变体**摆在真实 webview 里，顶部能当场切浅色/深色/自定义皮肤核对跟随效果，还能在 **React / Vue 之间切换**对照同一个组件。判断某个组件合不合适、或怀疑自己用错了，先看它，比猜快得多。

**方式一：npm（有 Node 环境时推荐）**

```bash
npx @finchtoys/minitools add @finchtoys/finch-ui-lab
```

**方式二：`.fapp` 离线包（不需要 Node，适合内网或发给同事）**

1. 到 [Releases](https://github.com/finchtoys/finch-ui/releases) 下载最新的 `finch-ui-lab-<version>.fapp`；
2. 把文件**拖进 Finch 主窗口**（或直接双击），弹出安装确认，点安装；
3. 打开**工具箱（Toolcase）**，找到 **Finch UI Lab**，打开启用开关 —— 装完默认是禁用的；
4. 回到任意会话，点右侧小程序启动器（Panel 的 `+` 菜单）里的 **Finch UI Lab**。

两种方式装完都要走第 3、4 步才看得见。这个小程序**不需要任何权限** —— 不读写文件、不联网、不开 shell。

## 主题

组件读 `--finch-*` CSS 变量。Finch 宿主会自动往小程序 webview 注入这套变量，**你不需要手动设**：

- 浅色 / 深色切换 → 自动跟随
- 用户在换肤工坊换自定义皮肤 → 自动跟随（约 1 秒内过渡）
- 脱离 Finch 单独打开页面 → 包自带默认主题，不会裸奔

**脱离 Finch 独立用时有一条要自己动**：深色档判定挂在 `[data-theme="dark"]` 上。Finch 宿主会设这个属性，独立页面得自己在祖先元素上设，否则永远是浅色。

**已知边界**：宿主只注入白名单内的 token。`--bg-inset`、`--danger-dim`、`--text-inverse`、`--ease-*`、`--duration-*` 不在白名单里，库内用 `color-mix` 从白名单值推导 —— 能跟着主题大方向走，但做不到和宿主逐值一致。

## 用之前要知道的几件事

| 组件 | 注意 |
|---|---|
| `DropdownSelect` | 默认**不走** portal，放进滚动容器会被裁切 —— 记得显式传 `portal` |
| `Toast`（仅 React） | 全局单例。每个页面要自己挂 `ToastViewport` 并注册，不能跨页面共享 |
| `Emoji` / `EmojiText`（仅 React） | 依赖 Vite `import.meta.glob` 内联 561 个 Twemoji SVG（约 1.2 MB）。非 Vite 项目用不了 |
| `Tooltip` / `HoverCard` | 反色底是硬编码色，不跟随自定义皮肤的色相（Finch 主程序本来也这样） |
| 所有浮层 | portal 容器是 webview 自己的 `document.body`，**浮层不可能越出小程序面板的物理边界**，靠边缘时会被 clamp 在面板内 |

## 给 AI 的引导

让 agent 直接写面板时，先把 skill 装上，它会替你把组件选型和上面这些坑都带着走：

```bash
npx @finchtoys/skills add finchtoys/finch-ui --skill finch-ui
```

skill 里除了选型规则，还有 **Vue 专属的坑**表和**维护者守则**（class 单一来源、`style.css` 不跨机器可复现、必跑的校验闸门）。

给 agent 的四条硬规则，任何一条违反都会静默坏掉：

1. 样式**只从 `@finchtoys/ui/style.css` 来**。不要引 Tailwind 自己补 utility，不要覆盖组件圆角/间距/配色 —— 那会立刻破坏「和 Finch 一致」这个唯一目的。
2. **不要自己写颜色**。主操作 `variant="primary"`，次要默认，危险用 danger 变体；需要读主题时用 `var(--finch-accent, #0db664)` 这种带 fallback 的写法，且只用 `--finch-*` 前缀那批。
3. **不要把 React 打进库**，也不要让页面出现两份 React / 两份 Vue。
4. 缺组件先查清单，别手写一套按钮/输入框混进去，视觉会打架。

## 仓库结构

| 目录 | 说明 |
|---|---|
| `library/` | `@finchtoys/ui` React 组件库源码，44 个组件 |
| `packages/vue/` | `@finchtoys/ui-vue` Vue 3 组件库，40 个组件（含独立 demo 与冒烟校验） |
| `lab/` | **Finch UI Lab** 预览小程序：真实 webview 里逐个组件展示所有状态与变体，可切主题、切 React/Vue |
| `skills/finch-ui/` | 给 AI 用的技能文件，让 agent 写面板时直接用对组件 |
| `docs/` | 抽包方案与实测验证记录 |

```bash
npm install
npm run build      # 库 → Vue → 面板
npm run verify     # 校验预编译 CSS、单 React、Vue 运行时隔离在懒加载 chunk
npm run typecheck
```

## 状态

`@finchtoys/ui 0.1.4` / `@finchtoys/ui-vue 0.1.1` / `@finchtoys/finch-ui-lab 0.1.4`。

React 组件源码目前是从 Finch 主仓 `src/renderer/ui/` **显式复制**过来的（`npm run sync` 生成，需要本地有一份 finch 检出，用 `FINCH_REPO` 指定路径），主程序暂时还没反过来依赖这个包 —— 也就是说**现在库和主程序是两份副本**，改动会漂移。收敛到主程序反向依赖是下一步，见 `docs/finch-ui-extraction-plan.md`。

Vue 版由 React 版**手工移植**，靠三层校验保证不漂：class 字符串单一来源、SSR 冒烟逐组件比对、7 个浮层组件的真实 DOM 对齐断言。

## 相关

- **[finchtoys/finch-releases](https://github.com/finchtoys/finch-releases)** —— Finch 小程序（扩展）的发布与社区注册表仓库：开发规范、发布检查清单、社区提交流程都在那里。
- **[Finch 官网](https://finchwork.app/)** · [文档](https://finchwork.app/zh/docs)
- [Releases](https://github.com/finchtoys/finch-ui/releases) —— 预览小程序 `.fapp` 离线包

## 许可

MIT
