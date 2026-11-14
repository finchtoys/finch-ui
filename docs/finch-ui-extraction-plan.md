# Finch UI 组件库独立成包 · 梳理与设计

> 状态：**方案评审稿（未实现）**。本文只做梳理与设计，不抽取代码、不建仓库。
> 起点：`src/renderer/ui/`（45 个 `.tsx`，其中 38 个组件 + 7 个测试），外加 `styles/`、`icons/`、`emoji/`、`hooks/`、`menuState.ts`、`modalStack.ts`、`selectTrigger.ts`。

---

## 0. 结论摘要（TL;DR）

1. **小程序能消费，但比预期多一道坎**：技术上完全可行——小程序 Panel 页面就是跑在独立 `<webview>` 里的**普通 Web 页面**，由本机静态服务器以 `http://127.0.0.1:<port>/` 提供，`<script type="module">`、CSS、字体、SVG 都能正常加载。
   但今天官方示例与小工具开发指南（SKILL.md）里的页面是**纯手写 HTML + 内联 `<style>` + 原生 JS**，**没有 React、没有构建步骤**。所以引入 React 组件库是给生态**新增一种范式**，而不是接上一根现成的线。

2. **主题层已经铺好，组件库是它明确规划的下一步**：`AppPanelThemeVar` / `webviewTheme.ts` 已把宿主主题以 `--finch-*` CSS 变量注入每个页面，代码注释与 SDK 文档里写明「**在完整 FinchUI 组件库落地之前，先只提供 token**」。这是现成的、被认可的接入契约。

3. **最大的真实技术障碍不是 React，而是两个命名/管线错配**：
   - 组件读的是宿主**内部** token（`--bg-hover` / `--text-primary` / `--accent` …），而对外只暴露 **`--finch-*`** 前缀；且组件用到的部分 token（`--bg-inset`、`--danger-dim`、`--danger-text`、`--text-inverse`、`--ease-out` …）**根本没在导出白名单里**。
   - 组件样式是 **Tailwind v4 utility class 字符串**（如 `bg-[color-mix(in_srgb,var(--bg-hover)_80%,transparent)]`），而小程序页面**没有 Tailwind 构建**。

4. **建议**：包名 `@finchtoys/ui`（对齐 `@finchtoys/minitool-api`）；独立仓库 `finchtoys/finch-ui`，以 `packages/finch-ui` submodule 被主仓反向依赖；包**预编译 CSS**（消费方不需要 Tailwind）；组件**直接消费 `--finch-*`**，主仓加一层别名把内部 `--bg-*` 映射成 `--finch-*`。v1 只放**纯展示/表单原语**（约 13 个），在一个真实 webview 小程序里跑通端到端链路。

---

## 1. 最关键的问题：小程序到底能不能消费这个包？

### 1.1 小程序 UI 是怎么构建和加载的（证据）

| 事项 | 事实 | 依据 |
|---|---|---|
| 页面形态 | 独立 Electron `<webview>` guest：`nodeIntegration=false`、`contextIsolation=true`、`sandbox=true`、独立 `partition` | `docs/webview-panel-design.md` |
| 加载方式 | 包内页面由平台静态服务器托管：`http://127.0.0.1:<port>/__finch_ext__/<extensionId>/<path>`，只监听 loopback，逐段校验路径防穿越 | `src/main/services/extension/panelStaticServer.ts` |
| 为什么不用 `file://` | file 协议是 opaque origin，`ESM <script type="module">` 与 `fetch()` 都会被 CORS 拦，所以必须以 http 提供 | 同上（文件头注释） |
| 页面내容 | manifest `contributes.appPanel.source = { type: "local" \| "url", path }`；`local` 由静态服务托管并注入 Bridge，`url` 不注入 | `src/main/services/extension/service.ts:829`，`docs/webview-panel-design.md` |
| MIME 支持 | `.js/.mjs/.cjs/.css/.json/.svg/.woff2/.ttf/.wasm/.png` … 全部按正确类型下发 | `panelStaticServer.ts` MIME_TYPES |
| CSP | **未对 webview 页面设置 Content-Security-Policy**；无 `webSecurity:false` 需求 | 全仓检索无 webview CSP 注入 |
| 页面能拿到什么 | 只有 `window.finch` 桥（postMessage / composer / capture / ui.toast / ui.confirm / navigation / spaces …）；**不暴露 Node / Electron / IPC / 任意文件读取** | `docs/webview-panel-design.md`、`packages/minitool-api/finch.d.ts` |
| 官方示例页面 | **纯 HTML**：内联 `<style>` + 原生 `<script>`，无框架无打包；`npm run build` 只是 `cp src/panel.html dist/panel.html` | `examples/extensions/webview-panel-lab/{src,dist}/panel.html`、其 `package.json#scripts.build` |
| 官方指南 | 只讲 `var(--finch-*, fallback)` 纯 CSS 适配，**从头到尾没有 React 这个词** | `skills/finch-mini-tool-creator/SKILL.md:266`、`reference/ui.md` |

### 1.2 结论

**能消费，且没有任何平台级阻断**：静态服务器按正确 MIME 下发 JS/CSS/字体/SVG，ESM 可用，无 CSP 拦截，页面就是个完整 Web 运行时。React 版本由**页面自己带**（页面就是独立 Web app），所以组件库必须把 `react`/`react-dom` 设为 **peerDependencies**，绝不能把 React 打进包里。

**但要诚实地标注两点风险**：

- **生态落差**：现有官方路径是「零构建的纯 HTML 页面」。组件库要求作者引入 Vite/打包器 + React，才能用上。这意味着**价值主张成立的条件是「确实有一批作者愿意为 Finch 观感付出构建成本」**——这正是 `docs/webview-theme-sharing-plan.md` 里被推迟的「方案 D」，当时推迟的理由是「维护成本高，先看 token 级共享的实际反馈」。本方案等于决定现在启动方案 D。
- **主题命名错配**（见 §4）：即使 React 跑起来，组件当前用的 token 名在 webview 里**取不到值**，必须先解决，否则渲染是「无主题的白板」。

**因此本方案的真实顺序应是**：先做一个最小验证（v1）——**一个 React 小程序页面，`npm i @finchtoys/ui`，引用 Button/Input/Toggle 并正确随宿主主题变色**。这条链路通了，方案才成立。

---

## 2. 耦合面盘点（逐个组件三档标注）

### 2.1 `src/renderer/ui/` 的整体依赖面（结论：极其干净）

对整个 `ui/` 目录做全量 import 扫描，**外部依赖只有 5 个**：

```
47  from "react"          (组件)
15  from "lucide-react"   (图标)
 9  from "vitest"         (测试)
 5  from "react-dom"      (portal)
 5  from "react-dom/server"(测试用 renderToStaticMarkup)
```

- **零** `../` 父级相对导入 → 目录自包含，没有一处伸手到 `components/`、`stores/`、`services/`。
- **零** i18n（`t(locale, …)` / `useLocale` / `resolveLocalePreference`）→ 组件不读语言，文案全部走 props。
- **零** `shared/types`、`stores`、`hooks/`（renderer 级）→ 唯一相关的是自带的 `ui/hooks/`。
- 样式形态：**Tailwind v4 utility class 字符串**（内联在 `className`）+ 少量宿主自有 CSS 类（写在 `ui/styles/*.css`）。
  例（`Button.tsx`）：`"inline-flex items-center justify-center font-medium! …"`、
  `"bg-[color-mix(in_srgb,var(--bg-inset)_30%,var(--bg-hover)_70%)] text-[var(--text-secondary)] …"`。

> 结论：**「哪些属于组件库」这条线是清楚的**，`ui/` 基本上可以整体搬。真正需要逐个做判断的只有两类：**用了 portal / 全局单例的**、**用了 Finch 业务语义或宿主资产的**。

### 2.2 A 档 · 可原样搬（零业务耦合，`react` + `lucide-react` + token CSS）

> 判据：无 `createPortal`、无模块级全局单例、无资产管线、文案全走 props。

| 组件 | 备注 |
|---|---|
| `Button` | 7 variant × 3 size + icon-only 模式 + `as="span"`，纯 props |
| `ButtonGroup` | 组合容器 |
| `Badge` | 纯展示 |
| `Chip` / `ActionChip` | 纯展示 |
| `Kbd` | 依赖 `.finchKbd` 类（`primitives.css`，通用） |
| `Input` / `TextArea` / `SecretInput` | 表单原语 |
| `CheckBox` / `ToggleSwitch` / `SegmentedControl` | 表单原语 |
| `OptionCard` | 选择卡 |
| `Alert` | 语义提示 |
| `Empty` | 空态 |
| `SkeletonBlock` | 骨架屏（注释里提到 Toolcase/usage，但组件本身通用） |
| `InlineActionLink` | 行内链接 |
| `ListRow` | 通用行（注释举例含 bot/space，但实现是通用行结构） |
| `TypingDots` / `WorkingText` | 动效原语；`WorkingText` 用局部 `--working-text-*` 变量 + `.workingText` 类，本身通用（属聊天语汇，见 §2.4 讨论） |
| `StepSlider` / `IconTabBar` / `Breadcrumb` | 通用交互件 |

### 2.3 B 档 · 可搬，但需注入依赖或做适配

| 组件 | 需要处理什么 |
|---|---|
| `Menu`（+ `menuState.ts`） | `createPortal → document.body` + 定位引擎（`ResizeObserver`/`scroll` 监听）。`menuState.ts` 是**模块级全局单例**（`openCount`），另含 `bindMenuCloseOnFocus()`——这条是**为 Electron webview 边界写的宿主逻辑**，包内应保留但默认不启用 |
| `Tooltip` | 同上：portal + 定位 + `window` 滚动/resize 监听 |
| `HoverCard` | portal + 定位 + `ResizeObserver` |
| `ModalShell`（+ `modalStack.ts`） | portal + `modalStack.ts` 顶层 z-index 计算，通用 |
| `ConfirmDialog` / `DialogMessage` | 构建在 ModalShell 之上；`DialogMessage` 有 `parseDialogImageLine` / `renderInlineTokens`（业务文案协议，需拆分通用/专用部分） |
| `Toast` | **全局单例 API**：`toast` / `registerToastApi` / `useToastApi` / `ToastViewport`；且**依赖 `LiquidGlassFilter`**（见 C 档）。要么把液态玻璃做成可选，要么随 Toast 一起裁掉 |
| `DropdownSelect` / `InlineSelect` / `MultiSelect` / `InputSelect` | 选择器家族，共享 `selectTrigger.ts`（定位/触发器逻辑），可整体搬 |
| `SearchField` | 依赖 `.sidebarSearchControl*` 类（`primitives.css`）——类名带业务前缀，搬迁时建议改名 |
| `TimePicker` | 时间选择，纯交互 |
| `ScrollArea` | `ResizeObserver` 自定义滚动条，通用 |
| `Emoji` / `EmojiText` / `emoji/twemoji.ts` | **需资产管线**：依赖 `@twemoji/parser` + `import.meta.glob("../assets/twemoji/*.svg")` + `scripts/build-twemoji-assets.mjs` 生成的映射。`import.meta.glob` 是 **Vite 专有语法**，包内必须改成显式资产导出或由消费者提供资源 |
| `ui/hooks/`（`useCollapseAnimation` / `useGlobalKeyHandler` / `useVisibleNow`） | 通用，需确认无宿主假设 |

### 2.4 C 档 · 排除（与 Finch 业务绑死）

| 项 | 排除理由 |
|---|---|
| `LiquidGlassFilter` | 通篇为 Finch 单例目标（Composer / 返回底部按钮 / Toast）而写，且由 `:root[data-liquid-glass="true"]` 上的宿主 CSS 规则决定启停（见 `composer.css` / `message.css`）。**不是通用件**，也把它从 `Toast` 依赖里摘掉 |
| `icons/BypassIcon` | 引用宿主公共资产 `url("/svg/bypass.svg")`，脱离主仓取不到图 |
| `icons/McpIcon` | MCP 官方标志的**业务兜底图标**（服务未下发图标时用），属业务语义 |
| `ui/styles/status.css`（`.sessionStatusDot*`） | **不是组件库的样式**：没有任何 `ui/` 组件用它，全部由 Session 业务引用（`Session.tsx`、`SessionSubtaskMenu.tsx`、`Sidebar.tsx`、`RunningIndicator.tsx`）。它是「寄居在 `ui/styles/` 的业务 CSS」 |
| `ui/styles/primitives.css` 中的 `.bot-row` / `.knowledgeScrollArea` / `rightSidebar__deliveryFlash` | 同上：业务类（`BotRow.tsx` 等引用），搬迁时应归还各自领域 |
| `ui/styles/overlays.css` 中的 `.quotaHoverCard--themed` / `.usageSkeleton` | 业务类（`ModelQuotaHoverCard.tsx` / `Usage.tsx` 等引用） |

> **重要发现**：`ui/styles/*.css` **不是纯组件库资产**，三个文件里混着业务遗留规则。
> 抽包时必须先把这些规则**归还给它们的领域 owner**（Session / sidebar / usage），
> 否则一抽就带走一堆业务样式，或反过来把业务样式留在主仓、组件库里留下悬空类名。

### 2.5 组件用到、但**不在**主题导出白名单里的 token

组件实际引用的 token（按出现次数）与 `AppPanelThemeVar` 白名单对比：

| 组件在用 · 已在白名单 | 组件在用 · **不在白名单**（webview 里取不到值） |
|---|---|
| `--accent` `--accent-hover` `--accent-dim` | `--bg-inset`(5) |
| `--text-primary/secondary/tertiary` | `--danger-dim`(8) `--danger-text`(3) |
| `--bg-hover` `--bg-active` `--bg-elevated` `--bg-main` | `--text-inverse`(1) |
| `--border` `--border-subtle` | `--warning-text` `--warning-dim` `--positive-text` `--positive-dim` `--info-soft` |
| `--radius-sm/md/lg` | `--ease-out`(3) `--duration-fast`(3)（动效 token） |
| `--danger` `--warning` `--positive` `--info` | `--fg-primary` `--primary` `--bg-sidebar` |

**结论**：导出白名单是宿主 token 的**子集**，且是最小集。要搬组件，必须**扩表**（见 §4）。

---

## 3. 打包形态建议

### 3.1 命名（对齐现有惯例）

现有 `packages/*` 全部是 `@finchtoys/*` npm 包 + `finchtoys/*` GitHub 仓库 + submodule：

| 目录 | npm 名 | 仓库 |
|---|---|---|
| `packages/minitool-api` | `@finchtoys/minitool-api` | `finchtoys/minitool-api` |
| `packages/minitools` | `@finchtoys/minitools` | `finchtoys/minitools-cli` |
| `packages/skills` | `@finchtoys/skills` | `finchtoys/skills-cli` |
| `packages/link-sdk` | `@finchtoys/link-sdk` | — |

**建议**：npm 名 **`@finchtoys/ui`**，仓库 **`finchtoys/finch-ui`**（保留舜子原本的仓库名）。
→ `@finchtoys/ui` 比 `finch-ui` 更好：与既有 scope 一致，且避免与已有 npm 包名冲突。

### 3.2 产物形态

```jsonc
{
  "name": "@finchtoys/ui",
  "type": "module",
  "sideEffects": ["*.css"],          // JS 可 tree-shake，CSS 不可
  "exports": {
    ".":            { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./style.css":  "./dist/finch-ui.css",
    "./icons":      { "types": "./dist/icons/index.d.ts", "import": "./dist/icons/index.js" }
  },
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  "dependencies": { "lucide-react": "^0.x" }   // 或也设为 peer，见下
}
```

关键决策：

- **ESM only**（主仓已是 `"type": "module"`，小程序页面用 `<script type="module">`，CJS 无必要）。
- **CSS 预编译、随包发布**，消费方 `import "@finchtoys/ui/style.css"`。
  **不要**要求消费方接 Tailwind——小程序页面没有 Tailwind 构建，且 Tailwind v4 跨包 `@source` 扫描会引入源文件解析依赖。
  构建流程：打包时用 Tailwind CLI 把组件里**用到的 utility 类** + `ui/styles` 的通用规则，编成一份静态 `finch-ui.css`。
  （这份 CSS 用的是**固定 utility 子集**，不会随消费方项目变化，可稳定发版。）
- **React/DOM 一律 peer**，绝不内联，否则 webview 里会出现两份 React。
- **`lucide-react`**：建议也设为 peer（主仓已有 `^0.556.0`，图标是独立可替换项），或作为 dependency 打进包但接受版本锁定。**推荐 peer**，理由与 React 相同：避免重复实例、让消费方控制图标版本。
- **不建 barrel 的仓库约定不适用于包**：包必须有一个公开入口 `index.ts` → `dist/index.js`（通过 `exports` 暴露）。内部仍按文件显式引用。
- 构建工具：`tsc`（类型）+ `vite build --mode lib` 或 `tsup`（ESM 打包）。与主仓现有 Vite 栈一致，推荐 Vite lib mode。

### 3.3 版本与发布

- semver，v1 前用 `0.x`，`publishConfig.access=public`，MIT（对齐其他 `@finchtoys/*`）。
- 发布走 npm public registry；变更走 Conventional Commits + release-please（与主仓一致）。

### 3.4 和主仓的关系（推荐 + 理由）

**推荐：独立仓库 `finchtoys/finch-ui` → submodule `packages/finch-ui` → 主仓反向依赖（反向消费）。**

理由：
1. **与现有 `packages/*` 惯例一致**：`minitool-api`、`minitools`、`skills` 全是 submodule，团队已有成熟的 submodule 指针更新流程（见 AGENTS.md「提交原子性」条款）。
2. **组件库的发布节奏必须独立于桌面 App**。若把包放在主仓内发布（subtree/publish from monorepo），任何组件级改动都会被 App 的发版节奏绑住，而小程序作者需要的是**能和 Finch 版本解耦**的组件库。
3. **submodule 优于「完全独立仓库 + 主仓不引用」**：主仓必须**自己吃自己的狗粮**。若主仓不引用包，就永远无法验证「包能否承载真实复杂度」，组件也必然分叉成两份。submodule + 反向依赖保证**单一事实来源**。

代价（必须接受）：
- 抽取后 `src/renderer/ui/` 的组件**整体移出**主仓，主仓改为 `import { Button } from "@finchtoys/ui"`。
- 主仓的 Tailwind 与 CSS 级联守卫必须相应调整（见 §4.3）。
- submodule 指针与包版本需同步提交（沿用 `minitool-api` 的原子提交规则）。

> 若舜子希望**更低风险**的起步：可作为过渡态，v1 先在独立仓库里放**组件副本**（主仓不动），只在一个示例小程序里验证；等 v1 端到端跑通，再执行「主仓删除 `ui/` + 改依赖 submodule」的正式迁移。这样 v1 失败时主仓零改动。

---

## 4. 主题策略

### 4.1 现状与问题

- 主仓组件读宿主**内部** token：`--bg-hover`、`--text-primary`、`--accent`、`--radius-sm` …
- webview 只注入**对外** token：`--finch-bg-hover`、`--finch-text-primary`、`--finch-accent`、`--finch-radius-sm` …
  映射表见 `src/renderer/components/webview/webviewTheme.ts` 的 `FINCH_THEME_VAR_MAP`。
- 两边**名字不同**，且白名单是子集（§2.5）。

### 4.2 推荐：统一以 `--finch-*` 作为组件库的公开 token 名，宿主做别名

1. **组件库只消费 `--finch-*`**（写成 `var(--finch-bg-hover, <兜底默认值>)`）。
   `--finch-*` 是**唯一已被写入 SDK 契约、且能被自动注入**的命名，语义上就是「Finch 观感」的公开接口。
2. **包自带一套默认主题**（`finch-ui.css` 里的 `:root` 定义 `--finch-*` 的浅色值 + `[data-theme="dark"]` / `@media (prefers-color-scheme: dark)` 深色值）。
   → 组件库**开箱可用**（脱离 Finch 单独渲染也好看），且**宿主的注入会覆盖它**（注入的 `:root` 优先级更高）。
3. **主仓加一层别名**，把内部 canonical token 暴露成 `--finch-*`：
   ```css
   /* src/renderer/styles/tokens.css 追加 */
   :root { --finch-bg-hover: var(--bg-hover); --finch-text-primary: var(--text-primary); /* … */ }
   ```
   这样**同一份组件代码**在主窗口与 webview 里都取到值，且不需要改主仓 ~100 个 CSS 文件。
4. **扩表**：把 §2.5 缺失的 token 补进 `AppPanelThemeVar` + `FINCH_THEME_VAR_MAP`（`--bg-inset`、`--danger-dim`、`--danger-text`、`--text-inverse`、`--warning-*`、`--positive-*`、`--info-soft`、`--ease-out`、`--duration-fast`）。
   同时把 `webviewTheme.ts` 的导出逻辑**从「读 `--bg-*` 改名」简化为「直接读 `--finch-*`」**（因为宿主已别名化），两端共用一份 `:root`。

> 备选（不推荐）：让包保留 `--bg-*` 内部名、由消费方自己定义 `--bg-*`。
> 理由：这等于把「宿主的私有命名」变成公开契约，webview 里又必须手写一份映射，越用越乱。

### 4.3 对 `rendererCssArchitecture` 级联基线守卫的影响（必须处理）

`src/renderer/architecture/rendererCssArchitecture.test.ts` 冻结了两件事：

1. **`styles/index.css` 的 import 列表**（含 `../ui/styles/primitives.css`、`../ui/styles/overlays.css`、`../ui/styles/status.css` 三条）。
2. **所有 cascade 文件拼接后的声明内容 sha256**（`__baseline__/cascade-order.sha256`）。

把 CSS 抽走后：
- 上述三条 import 要从 `expectedImports` 中移除 → 改测试。
- 拼接内容变化 → 必须跑 `npm run test:css-baseline:update` 重生成基线，**并按测试注释的约定补一行「哪次改动、为什么」**。
- **`ui/styles/*.css` 里的业务遗留规则**（`.sessionStatusDot*`、`.bot-row`、`.quotaHoverCard--themed` 等）必须先归还到各自领域的 CSS 文件，否则这些规则会随文件一起消失或错位。
- 该守卫还断言「**根 CSS 与旧入口归零**」「**Feature CSS 不跨写**」「**自定义动画 utility 都有对应 token**」，抽包后需一并复核。

**结论**：抽走 CSS **不是零成本**，它牵动一个受冻结的架构守卫；这是本方案里最容易「抽完发现主干变红」的地方，必须规划为迁移阶段的一个显式任务。

---

## 5. 分阶段落地计划

### v1 目标（唯一目标）：跑通「小程序真的能 `npm i @finchtoys/ui` 并正确渲染」这条端到端链路

**v1 边界（明确划出）**——只放**零 portal、零全局单例、零资产管线、零业务语义**的一批：

> `Button`、`ButtonGroup`、`Badge`、`Chip`、`Kbd`、`Input`、`TextArea`、`SecretInput`、
> `CheckBox`、`ToggleSwitch`、`SegmentedControl`、`OptionCard`、`Alert`、`Empty`

（14 个，全部 A 档。刻意不含 `Tooltip`/`Menu`/`Toast` 等 portal/单例件，也刻意不含 `Emoji` 资产管线件。）

**v1 验收（端到端，必须是真 webview，不是浏览器里看截图）**：
1. 一个示例小程序（可基于 `examples/extensions/webview-panel-lab` 新建 `finch-ui-lab`），页面用 Vite 打包成 React app，`dist/panel.html` 指向打包产物。
2. 页面 `import "@finchtoys/ui/style.css"` 与 `import { Button, Input, ToggleSwitch, Badge, Kbd } from "@finchtoys/ui"`。
3. 在 Finch 里打开该 Panel，确认：浅/深主题切换时组件**跟随变色**；自定义皮肤（换肤工坊）生效时也跟随；`--finch-theme-mode` 可读。
4. 脱离 Finch 直接用浏览器打开该 `panel.html`，确认包自带默认主题下**不裸奔**。
5. 记录：包体积、是否出现双 React 警告、CSS 是否需消费方额外配置。

### 后续阶段（每阶段一次评审，不并跑）

- **v2 · portal / 浮层件**：`Tooltip`、`Menu`、`DropdownSelect`、`InlineSelect`、`MultiSelect`、`InputSelect`、`SearchField`、`TimePicker`、`HoverCard`、`ScrollArea`。
  验证点：portal 到 `document.body` 在 webview 里定位正确（webview 的 viewport/滚动容器与主窗口不同）；`menuState` 全局单例不冲突。
- **v3 · 对话框 / Toast**：`ModalShell`、`ConfirmDialog`、`DialogMessage`、`Toast`（**先解耦 `LiquidGlassFilter`**，玻璃效果作为可选 feature 或直接不做）。
- **v4 · 资产件**：`Emoji`/`EmojiText`（把 `import.meta.glob` 改成显式资产导出 + 独立的 `@finchtoys/ui/twemoji` 资源入口）。
- **v5 · 主仓收敛**：主仓删除 `src/renderer/ui/` 的对应组件，改为依赖 `@finchtoys/ui`；处理 §4.3 的 CSS 守卫；保证主窗口视觉零回归（对比截图）。

### v1 明确**不做**的事

- 不动主仓 `src/renderer/ui/`（过渡态：独立仓库放副本）。
- 不碰 `rendererCssArchitecture` 基线。
- 不抽 `LiquidGlassFilter`、`status.css`、`BypassIcon`、`McpIcon` 与 `ui/styles/*.css` 里的业务规则。
- 不追求「45 个全搬」。

---

## 6. 需要舜子拍板的点

| # | 决策点 | 我的建议 | 备选 |
|---|---|---|---|
| 1 | **npm 包名** | `@finchtoys/ui` | `finch-ui` / `@finchtoys/finch-ui` |
| 2 | **主仓关系** | 独立仓库 `finchtoys/finch-ui` → submodule `packages/finch-ui` → 主仓反向依赖；**v1 用过渡态**（先放副本、主仓不动） | 直接一步到位搬迁（风险高） / 包留在主仓内发布（发布节奏被绑） |
| 3 | **v1 范围** | §5 的 14 个纯原语，只做端到端链路验证 | 是否把 `Tooltip` 也纳入 v1（能顺带验证 portal） |
| 4 | **主题策略** | 组件统一消费 `--finch-*`；包自带默认主题；主仓加别名层；同步扩表 | 让包保留 `--bg-*` 私有名（不推荐） |
| 5 | **CSS 分发** | 预编译随包发布，消费方不需要 Tailwind | 发 Tailwind 源 + `@source` 扫描（要求消费方接 Tailwind） |
| 6 | **`lucide-react`** | peerDependency（与 React 同理） | dependency（版本由包锁定） |
| 7 | **是否值得做** | 这是被推迟的「方案 D」，需要确认：**是否真有足够多的小程序作者愿意为 Finch 观感引入 React + 构建链** | 继续只做 token 级共享，暂不投入组件库 |

---

## 7. 未决项 / 待验证（v1 之前必须实测）

1. **webview 内 portal 定位**：`createPortal(document.body)` 在 `<webview>` guest 中的 `position: fixed` 定位与宿主滚动容器是否一致（影响 v2 全部浮层件）。
2. **双 React / 双 lucide 实例**：peer 依赖下页面打包是否干净，`menuState` 这类模块级单例在两份实例下会不会行为分裂。
3. **包体积**：React 组件库 + lucide 图标子集打进一个小程序页面，是否有可感知的冷启动/首帧成本（webview 有 `concealWebviewUntilThemed` 首帧门控，需确认不影响注入时序）。
4. **Tailwind 预编译 CSS 的完整性**：组件里存在 `bg-[color-mix(in_srgb,var(--bg-hover)_80%,transparent)]` 这类**任意值 utility**，预编译时是否能被 Tailwind 正确扫到（主仓已踩过「任意值 utility 紧贴模板插值被静默丢弃」的坑，见 `rendererCssArchitecture.test.ts` 中 `panel.match(/\]\$\{/g)` 那条断言）。
5. **`--finch-*` 扩表后与自定义皮肤的一致性**：新增的 `--bg-inset`/`--danger-dim` 等在主仓由 `customTheme.ts` 换肤计算，需确认别名层取到的是换肤后的最终值。

---

## 附：受影响文件清单（迁移阶段参考，非 v1）

- `packages/minitool-api/finch.d.ts` · `skills/finch-mini-tool-creator/reference/finch.d.ts`（`AppPanelThemeVar` 扩表，两者须一致）
- `src/renderer/components/webview/webviewTheme.ts`（`FINCH_THEME_VAR_MAP`）
- `src/renderer/styles/index.css`（移除 `ui/styles/*` 三条 import）
- `src/renderer/styles/tokens.css`（新增 `--finch-*` 别名块）
- `src/renderer/architecture/rendererCssArchitecture.test.ts` + `__baseline__/cascade-order.sha256`
- `src/renderer/ui/**`（抽走或改依赖）
- `docs/webview-theme-sharing-plan.md`（「Out of scope」一节需更新为「已启动」）
- `.gitmodules`（新增 `packages/finch-ui`）
