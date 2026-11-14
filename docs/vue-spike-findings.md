# Finch UI · Vue 3 spike 结论

> 2026-11-14。用 Vue 3 重写了 `Button` / `Input` / `ToggleSwitch` / `ModalShell` / `Menu` 五个组件，与未修改的 React 版并排实测比对。
> 代码在 `spike/vue/`，`library/` 与 `lab/` 一行未改，没有发包。本文每条结论都附可复现证据。

---

## 0. 结论摘要

| 命题 | 结论 | 一句话依据 |
|---|---|---|
| 1 · 视觉零漂移 | **通过** | 41 个场景、99 个元素实例 × 57 条 CSS 属性（每主题 5,643 次比较，浅/深两套共 11,286 次）**全部相同**；class 字符串逐字节相同；32 组截图在浅/深两色下**逐像素相同** |
| 2 · portal 行为一致 | **通过** | teleport 到 `document.body`、`position:fixed`、逃出 `overflow` 裁切、跟随嵌套滚动（与锚点相对位移恒 28px）——与验证文档里 React 在真实 guest 的实测值**完全一致** |
| 3 · 模态行为 | **通过** | Esc 只关最上层（2→1→0，剩的确实是「外层」）、遮罩点击默认不关、`closeOnBackdrop` 可关、打开时 blur 掉当前焦点 |
| 4 · 双框架共存成本 | **抽单一来源（方案 A），已落地 5 个组件**；动手时必须同时改两处构建指纹，否则 Tailwind 产物和 `verify` 都会漏 | 详见 §5。这不是风格偏好，是有一条硬门槛：class 字符串现在同时是 **Tailwind 的扫描输入**和 **verify-build 的覆盖断言输入**。落地后 `dist/style.css` 指纹不变、156/156 覆盖仍过、Vue 侧复测仍 0 差异 |

一句话判断：**技术上没有拦路虎，Vue 版能和 React 版做到像素级一致**。真正的成本不在重写组件，在「同一套 class 字符串要不要分两份」这个决定，以及随之而来的构建/校验链路改造。

---

## 1. 怎么验的

```
spike/vue/                     独立 npm 包（vue 3.5 + vite 6 + playwright-core），自己的 node_modules
  src/shared/classes.ts        re-export shim → library/styles/classes.ts（命题 4 已落地）
  src/vue/*.vue                5 个 Vue SFC + 2 个 lucide 图标的 DOM 替身
  src/harness/react-trees.tsx  直接用 library/components/*.tsx 原件搭场景
  src/harness/vue-trees.ts     同一批场景的 Vue 版本
  src/harness/registry.ts      41 个场景 + 交互脚本
  scripts/compare.mjs          headless Chromium：样式/行为 + 真实鼠标键盘 + 截图逐字节比对
  report/comparison-*.json     机器可读结果
```

复现：

```bash
cd spike/vue && npm install
npm run build            # 产物里的 CSS 与 library/dist/style.css 逐字节相同
npm run report           # 浅色 + 深色两轮，输出 report/comparison-{light,dark}.json
```

关键点：**React 和 Vue 在同一张页面、同一份样式表、同一个引擎里分别单挂-采集-卸载**，不是「两个浏览器截图差不多」。样式表就是 `library/dist/style.css`（77,589 字节），Vue 侧构建后仍然是 **77,589 字节、逐字节相同**——没有重新跑 Tailwind，这也验证了「Vue 不需要重编译样式」这个前提。

采集的 57 条属性覆盖盒模型（padding/margin/宽高/gap）、圆角四角、边框宽/色/线型、字体族/字号/字重/行高/字距、颜色/背景/阴影/透明度/`backdrop-filter`、`transition-*`、`animation-name`、`transform`、`cursor`/`pointer-events`/`user-select`、`visibility`/`z-index`/`overflow` 等。另外每个元素还比对 `tagName`、`class` 全串、`role`/`aria-*`/`data-*`/`disabled`/`type`，以及几何 `x/y/width/height`（容差 1px）。

**先证明这套探针有本事发现漂移**：`ButtonDriftControl.vue` 是只删掉一个 `font-medium!` 的 Vue 按钮。harness 稳定报出 `font-weight 500 → 400`（`controlDetected: true`）。没有这个负向对照，「零漂移」的结论就是自证清白。

---

## 2. 命题 1 · 视觉零漂移：通过

### 2.1 数据

| 项 | 浅色 | 深色 |
|---|---|---|
| 场景数 | 41 | 41 |
| 采样元素实例 | 99 | 99 |
| CSS 属性比较次数 | 5,643 | 5,643 |
| 差异条目 | **0** | **0** |
| class 字符串不同的元素 | **0** | **0** |
| 截图对（逐字节） | 38 组全部相同 | 38 组全部相同 |
| 空白截图 | 0 | 0 |
| 控制台错误 | 0 | 0 |

截图逐字节相同意味着连抗锯齿都一样，比「肉眼看着一样」强一档。覆盖到的变化维度：Button 7 variant × 3 size × 4 round × 图标模式 × pressed/disabled/`as="span"`；Input 3 variant × 3 size × error/hint/adornment/mono；Toggle 开关/尺寸/禁用；ModalShell 默认/无表头/`headerRight`/`closeOnBackdrop`/嵌套；Menu 四向定位 + 菜单项 active/danger/分隔线。

深色一轮不是走过场：`btn-primary` 背景 `color(srgb 0.051 0.714 0.392)` → `color(srgb 0.151 0.615 0.442)`，`input` 背景 `rgb(240,240,240)` → `rgb(34,34,34)`，确认 `data-theme` 真的切换了 token。

### 2.2 但「零漂移」不是免费的：我实际踩到的 4 个坑

这四条都是**框架语义差异**，不是我的笔误，全量重写 44 个组件时会反复遇到：

| # | 现象 | 根因 | 影响面 |
|---|---|---|---|
| 1 | 所有 Menu 停在 `left:0; top:0`、`visibility:hidden` | **Vue 的 `watch` 不会在创建时执行，React 的 `useLayoutEffect` 每次挂载都执行**。首次就以 `open=true` 挂载时，定位副作用一次都没跑 | 所有浮层件 + 任何「挂载即测量」的逻辑（Tooltip/HoverCard/DropdownSelect/ScrollArea） |
| 2 | 定位算对了但 DOM 还是 `0px` | **React 给数字型 style 补 `px`，Vue 不补**。`style.left = 12` 被静默丢弃 | 所有内联样式：ToggleSwitch（8 个值）、StepSlider、IconTabBar、SkeletonBlock、Toast、Tooltip、HoverCard、ListRow 等 24 处 `style={{...}}` |
| 3 | 每个按钮都多了 `aria-pressed="false"` | **Vue 会把「缺省的 boolean prop」强转成 `false`**，React 保持 `undefined` | 所有 `boolean \| undefined` 语义的 prop（pressed / noHeader / backdropOnly / closeOnBackdrop / mono / disabled…） |
| 4 | Modal 里凭空多出 `headerRight` 内容 | React 的 node prop 可以被「不传」，Vue 的 slot 只要在模板里声明就一直渲染 | 所有 `ReactNode` 型 prop（icon / headerRight / endAdornment / trailing） |

前三个在 Vue 里有标准解法（`onMounted` 补一次 + `flush:'post'`；style 值一律输出 `"12px"` 字符串；`withDefaults({ pressed: undefined })`），第四个是 API 设计层面的必然差异：**Vue 的等价物是 slot 存不存在，不是 prop 存的值为空**。这四条我都已经在 `source` 里修掉并写了注释——它们也是「为什么必须做这种并排实测，而不能只对着文档翻译」的答案。

### 2.3 附带发现：这次实测当场抓到了一个「活」的漂移

我开工时 `library/components/Input.tsx` 的 `INPUT_BASE_CLASS` 里还有 `font-medium`（500 字重），我照着它写了共享模块。**23:00 时另一路工作把这个 `font-medium` 去掉了**（`305e9bd fix(ui): Input / TextArea 不再默认 500 字重`，舜子定的输入正文用常规字重），重建后的 `dist/style.css` 与之前逐字节相同（`font-medium` 仍被其他组件用到，产物不变）。

下一轮 harness 立刻报出：

```
input-default  class  onlyVue:["font-medium"]
               style  font-weight 400 | 500
```

没有任何提示、没有编译错误、`npm run build` 也全绿——**只有「渲染结果逐属性比对」能发现它**。共享模块同步到新源码后归零。这正是命题 4 要解决的问题在真实工程里的样子：不是理论风险，是改一次输入框字重就会发生的事。

---

## 3. 命题 2 · portal 行为：通过

真实鼠标/键盘驱动（Playwright），不是合成事件派发：

| 检查项 | React 实测 | Vue 实测 |
|---|---|---|
| portal 父节点是 `document.body` | 是 | 是 |
| `position:fixed` | 是 | 是 |
| 逃出 `overflow:auto` 容器裁切（`elementFromPoint` 命中菜单项） | 命中 `BUTTON` | 命中 `BUTTON` |
| 菜单与锚点相对位移（打开时） | 28px | 28px |
| 嵌套容器滚动 20px 后相对位移 | 28px（锚点移动 20px） | 28px（锚点移动 20px） |
| 真实滚轮滚动后相对位移 | 28px | 28px |
| 底部空间不足 → 向上翻转 | 翻转到锚点上方 | 相同 |
| `right-start` 往右展开 | 是 | 是 |
| `anchorPoint`（右键菜单）滚动即关闭 | 关闭（0 个面板） | 关闭（0 个面板） |
| 外部 pointerdown 关闭 | 关闭 | 关闭 |
| Esc 关闭 | 关闭 | 关闭 |
| 卸载后残留 portal 节点 | 0 | 0 |

值得单独说一句：**28px 这个数字和验证文档里 React 在真实 Finch guest 内的实测值（「菜单与锚点相对位移恒为 28px」）完全吻合**，说明我这套 harness 复现出了同一套 React 行为，Vue 又和它逐项对齐。范围上诚实标注：本轮是在 Chromium 里跑的（与 Electron guest 同内核、同布局语义），**没有**再进一次真实 webview；portal 的 `document.body` 在 guest 里就是 guest 自己的 body 这条结构性限制（浮层出不了 webview 物理边界）不因框架而变。

---

## 4. 命题 3 · 模态行为：通过

| 检查项 | React | Vue |
|---|---|---|
| 嵌套两层弹窗，一次 Esc 后剩几层 | 1 | 1 |
| 剩下的是哪一层 | 「外层」（z-index 较小者保留） | 「外层」 |
| 第二次 Esc | 0 | 0 |
| 真实键盘 `Escape`（Playwright）| 2 → 1 → 0 | 2 → 1 → 0 |
| 默认 `closeOnBackdrop=false` 点遮罩 | 不关（仍 1 层） | 不关 |
| `closeOnBackdrop=true` 点遮罩 | 关闭（0 层） | 关闭 |
| 打开时当前焦点被 blur | `activeElement` = `body` | 同 |
| 遮罩铺满视口 | 900×700 | 900×700 |
| 表头分割线/标题/关闭按钮/图标几何 | — | 逐属性相同 |

「只关最上层」用的是同一份 `modalStack.ts`（纯函数，两框架直接共用），加上同一个 `[data-finch-modal-shell]` 属性 + z-index 扫描。Vue 侧唯一要小心的是 `data-finch-modal-shell` 的写法：JSX 里裸写属性渲染成 `="true"`，Vue 模板里裸写渲染成 `=""`，我改成显式 `:data-finch-modal-shell="'true'"` 才做到 DOM 一致（功能上等价，但既然要比就比到底）。

---

## 5. 命题 4 · 双框架共存成本：抽单一来源，但有硬门槛

### 5.1 先看清楚「class 字符串」现在是什么角色

它不是普通实现细节，同时是三件事的输入：

1. **Tailwind 的扫描源**：`library/styles/finch-ui.css` 里 `@source "../components"` —— 预编译 CSS 的全部 utility 都来自扫这个目录。
2. **`verify-build.mjs` 的覆盖断言源**：脚本解析 `components/**/*.tsx` 的字符串字面量，抽出所有任意值候选（目前 156 条），逐条到 `dist/style.css` 里找转义后的精确选择器 + 非空声明，缺一条就 `exit 1`。
3. **组件渲染时的实际 class**。

现状规模：38 个组件文件里 **307 个 class 字符串字面量、251 个不同的字符串、402 个不同 token**（库总 4,997 行 / 4,103 行有效代码）。

### 5.2 两个方案的实测对比

| | A · 抽单一来源 `styles/classes.ts` | B · 各写一份 + 测试锁一致性 |
|---|---|---|
| 本 spike 的做法 | `spike/vue/src/shared/classes.ts`：纯 TS、零运行时依赖、零框架类型；class 组装 + 定位代数 + 几何常量全部抽出。React 侧**原样不动**，Vue 侧 import 它 | 已顺带验证：harness 本身就能当一致性测试——它比对渲染后的 `class` 全串，发现差异就报 |
| 一致性保证 | **结构性**：只有一份字符串，不可能漂移 | **事后**：漂了才发现；测试挂了才修 |
| 需要改的地方 | React 44 个组件改成 import（机械但量不小）；**`finch-ui.css` 加 `@source "./classes.ts"`**；**`verify-build.mjs` 的扫描路径加这个文件** | 无（不动现有构建） |
| 已验证 | Vue 渲染出的 class 串与 React **逐字节相同**（token 集合相同 + 顺序也相同，包括 `[BASE, VARIANT, SIZE, ROUND, pressed, callerClass]` 这个拼接顺序） | 探针灵敏度已验证（删一个 token 就能抓到） |
| 风险 | 一次性重构面积大；动到 CSS 构建指纹，`dist/style.css` 可能变化（需重新生成并 diff 产物） | 长期双维护 + 漂移；且**测试只能拦住「渲染出来的 class」不一致，拦不住内联样式/属性语义**（本轮 4 个坑里有 2 个就是这样漏出来的） |
| 我的判断 | **推荐**。它把「一致性」从测试问题降级成编译问题 | 只适合作为过渡态的兜底 |

### 5.3 落地形状（2026-11-14 已按此执行，见 §5.4）

1. 新建 `library/styles/classes.ts`（框架中立，直接从现有组件里搬字符串，**先只搬、不改任何字符串**）。
2. 同步两处构建指纹：`finch-ui.css` 的 `@source`、`verify-build.mjs` 的扫描列表。**这两条不做，Tailwind 产物会静默少掉 utility、verify 会静默少扫一批候选**——这是整个方案唯一会「静默出问题」的地方，必须一起改。
3. React 组件先切到共享模块，保持 `dist/style.css` 逐字节不变（用 `git diff` 卡住），此时行为毫无变化。
4. Vue 侧再进来，class 天然同源。
5. 静态样式之外，**内联样式和 DOM 属性语义必须另立一致性测试**（本轮 4 个坑里 3 个出在这两类）。共享模块只负责 class 与纯计算，不要试图用它掩盖这两块。

> 一个反直觉但重要的点：抽单一来源之后，**不能**指望「class 单源」等于「视觉零漂移」。它只覆盖了约 6 成风险面。剩下 4 成在：内联样式（24 处 `style={{}}`）、prop→DOM 属性映射（`aria-*`、`data-*`）、节点结构（node prop vs slot）、生命周期时序（`useLayoutEffect` vs `watch`）。

### 5.4 落地记录（2026-11-14，已合并）

**做了什么**（范围：spike 验证过的 5 个组件）

| 动作 | 文件 |
|---|---|
| 新建框架中立的共享模块：class 组装、尺寸/圆角表、内联样式值、定位代数 | `library/styles/classes.ts` |
| 5 个组件改为 import，自身不再持有任何 class 字面量（含默认值、`as="span"`、thumb 类、表头类） | `library/components/{Button,Input,ToggleSwitch,ModalShell,Menu}.tsx` |
| Tailwind 扫描加入共享模块 | `library/styles/finch-ui.css` → `@source "./classes.ts"` |
| verify 扫描加入共享模块，并新增「已迁移组件不得再出现 class 字面量」的硬断言 | `library/verify-build.mjs` |
| Vue 侧改为直接消费库内模块（`@shared/classes` 变成 re-export shim） | `spike/vue/src/shared/classes.ts` + `ToggleSwitch.vue` |

**为什么内联样式和定位代数也一起搬了**：`ToggleSwitch` 有 8 个内联样式值、`Menu` 有 2 个定位值 + 一套翻转/夹取代数。留着它们在各框架各写一遍，等于把本轮踩到的第 1、2 号坑（`watch` 不执行、数字不补 `px`）永久留在代码里。现在 `toggleSwitchTrackStyle()` / `menuPanelStyle()` 直接返回 `"42px"` 这类 CSS 字符串，两边都正确。

**验收证据**

| 检查 | 结果 |
|---|---|
| `dist/style.css` 指纹 | `236073b1…` **与重构前逐字节相同**（77,589 字节）——说明一条 utility 都没丢、没多 |
| `npm run verify` | PASS；任意值覆盖仍 **156/156**，单 React 根断言仍通过 |
| 新闸门是否真的会拦 | 手工把 `ToggleSwitch` 的 thumb 类改回字面量 → `AssertionError: Class string outside styles/classes.ts: components/ToggleSwitch.tsx:42`；改回后 PASS |
| 全仓构建 + lab typecheck | 通过 |
| Vue 与 React 并排复测 | 41 场景 × 浅/深两套主题 **仍全 0 差异**，38 组截图仍逐字节相同 |
| 公开 API | `Button` 的类型、`INPUT_*` 常量继续从原位置导出（改为 re-export），`lab` 与新消费者无需改动 |

**还没迁移**：其余 33 个组件文件。新闸门目前只覆盖名单里的 5 个（`SHARED_CLASS_COMPONENTS`），迁移一个就往名单里加一行，闸门自动接手。`Chip` / `Badge` / `Kbd` 这类纯展示件是机械活；`Tooltip` / `HoverCard` / `DropdownSelect` 建议连同它们的定位代数一起搬，否则会重演「两份定位代码」。`Emoji` / `LiquidGlassFilter` / `Toast` 属于 C 类，先解耦再谈迁移。

---

## 6. 全量 Vue 版的成本估算

### 6.1 组件分类（按 38 个文件 / 57 个导出符号 / 实际约 44 个组件算）

| 类别 | 判据 | 数量 | 代表 | 单组件工作量 |
|---|---|---|---|---|
| **A · 可直接搬** | 无 hooks、无 portal、无状态机，纯 class + 结构 | **约 20** | Badge / Chip / Kbd / Empty / Alert / Breadcrumb / ButtonGroup / ListRow / OptionCard / SegmentedControl / SkeletonBlock / InlineActionLink / TypingDots / WorkingText / DialogMessage / TextArea / CheckBox / StepSlider / IconTabBar / ToggleSwitch | 0.3–0.6 h |
| **B · 需重写逻辑** | 用了 hooks / portal / 定位 / 焦点 / 测量 / 状态机 | **15** | Button / Input / SecretInput / InputSelect / InlineSelect / DropdownSelect / MultiSelect / SearchField / TimePicker / ScrollArea / Tooltip / HoverCard / Menu(+Submenu) / ModalShell / ConfirmDialog | 1.5–3 h（Menu/Tooltip/HoverCard/DropdownSelect 取上限） |
| **C · 搬不动 / 需改造** | 依赖 Vite 专有资产管线或宿主单例 | **4–5** | Emoji / EmojiText（`import.meta.glob` 内联 561 个 SVG）、LiquidGlassFilter（宿主 CSS 单例）、Toast（全局单例 + 宿主玻璃滤镜）、Tooltip/HoverCard 的硬编码反色底（主仓自身欠债） | 0.5–1 天/个，且需先做解耦设计 |

合计一次性重写：约 **9 + 33 + 24 ≈ 66 人时（≈ 8–9 人日）**，加 harness/回归基建 2–3 人日，**合计约 10–13 人日**（不含 C 类真正解耦的方案设计与评审，那部分建议单独排期）。

参考实测比例：这次 5 个组件 React 1,012 行 → Vue 719 行（含注释），**代码量约 0.71×**，但工作量不是按行数算的——`Menu.tsx` 480 行里真正的难点是 4 个 hook 的时序，`Chip.tsx` 69 行反而最快。

### 6.2 持续成本（这才是决定要不要做的部分）

- 走**单一来源**：每次组件改动 ≈ 改一处 class/逻辑 + Vue 侧照抄模板结构，**增量约 +10–15%**。
- 走**两份 copies**：每次改动两遍 + 一次一致性验证，**增量约 +60–100%**，且漂移是概率事件不是错误——本次就抓到一个现成实例（Input 字重，§2.3）。
- 无论哪条路，**新增组件**都要写两遍（模板层无法共享），这是双框架的固定税。
- CI 需要多一套 harness（本 spike 的 `compare.mjs` 就是雏形，约 300 行 Node，跑一轮浅色 + 深色约 80 秒）。

### 6.3 三个必须先想清楚的前置问题

1. **谁来消费 Vue 版？** 现在 Finch 主窗口是 React（这是既成事实），小程序生态是「零构建纯 HTML」。Vue 版如果不落在某个真实消费方上，它就是第二个需要养的副本。这个问题比技术可行性重要得多。
2. **Vue 侧的「新 class」从哪来？** 复用 `dist/style.css` 意味着 Vue 组件只能用**已有**的 utility 词汇。任何 Vue 特有的新样式类在预编译产物里不存在，会静默失效（我这轮就被迫用 harness 自己的 CSS 定义 `.spike-modal` 宽度）。所以「Vue 版零构建」只在「不新增样式类」的前提下成立；一旦要新增，就得回到 Tailwind 重编，或者让两个框架各自维护一套 CSS。
3. **事件/受控语义**：React 的受控组件（`onChange` 每次输入都触发）和 Vue 的 `v-model` 语义不同。本轮 Input 只做了渲染比对，`v-model` 的等价性没有系统验证（见 §7）。

---

## 7. 没做到 / 不通过 / 需舜子肉眼确认

**没做到（本轮明确未覆盖，不要当成已通过）：**

1. **真实 Finch webview 内没跑。** 本轮全在 Chromium（与 Electron guest 同内核）。portal 的结构性边界（出不了 webview）与验证文档结论一致，但没有再实测一次。
2. **只验了 5 个组件**，占全量约 11%。B 类里最难的四件（Tooltip / HoverCard / DropdownSelect / Toast）都没碰。
3. **hover/active 状态没有全矩阵。** 静止态 41 场景全覆盖，交互态只做了 6 个真实指针探针（primary hover、secondary hover、input focus、toggle click、Esc、滚轮）。其余 hover 变体的等价性是靠「class 串逐字节相同」推出来的，不是逐条实测。
4. **`v-model` / 受控输入语义**未系统验证（渲染等价已验，双向绑定、IME、光标位置未验）。
5. **MenuSubmenu 没实现。** 定位代数已抽到共享模块（`menuPosition`），组件本体未重写，估 B 类 +1–1.5 h。
6. **无障碍树没有对比**（`role`/`aria-*` 属性值已逐元素比对，但 axe/无障碍树没跑）。

**需舜子肉眼确认：**

1. `docs/assets/vue-spike/menu-vue.png`、`modal-vue-dark.png` 是 Vue 版实拍，看一眼是否符合你对「Finch 观感」的预期（尤其菜单的毛玻璃与圆角）。

---

## 8. 下一步

**已做（2026-11-14，命题 4 方案 A 落地，见 §5.4）**：`library/styles/classes.ts` 建立、5 个组件迁移、`@source` 与 `verify-build.mjs` 两处指纹同步、新增「已迁移组件不得出现 class 字面量」硬闸门、Vue 侧改吃库内模块并复测 0 差异。

**接下来按顺序**：

1. 先定 §6.3 的「谁消费 Vue 版」——没有真实消费方之前，不要再扩组件。
2. 把剩下 33 个组件分批迁进 `styles/classes.ts`（每批迁移后跑 `npm run verify` 并确认 `dist/style.css` 指纹不变）。迁移顺序建议：纯展示件（Chip/Badge/Kbd/Empty/Alert/SkeletonBlock…）→ 表单件（CheckBox/SecretInput/SegmentedControl/OptionCard…）→ 浮层件（Tooltip/HoverCard/DropdownSelect/InlineSelect/MultiSelect/TimePicker，连同定位代数一起搬）。
3. 把 `spike/vue/scripts/compare.mjs` 提成 CI 任务，扩到所有已移植组件；再补一层 Node 端一致性断言（SSR 渲染后比 `class` 属性，秒级，不必开浏览器），让「没开浏览器」的 PR 也能拦住漂移。
4. C 类（Emoji / LiquidGlassFilter / Toast）单独出解耦方案，别混在移植里做。
