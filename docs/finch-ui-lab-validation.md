# Finch UI Lab 验证记录

> 2026-11-14；实测完成，结论见「最终结论」。沿用已有四组件 spike，扩展为 A/B 档组件预览。此文不是发布许可。

## 边界与实施方式

- 只修改 `examples/extensions/finch-ui-lab/` 和验证文档。不建仓库、不发布 npm、不改主仓 UI、CSS 架构测试或基线。
- 四组件现有代码保留为起点；新增组件是有来源清单的本地副本。以同步脚本记录机械适配，避免副本手工漂移。
- 本地私有 `@finchtoys/ui` 验证库：React/ReactDOM/lucide 保持 peer + external；先构建库及 CSS，再由不配置 Tailwind 的 React 页面消费。
- 主题：公开 `--finch-*` 只读，组件使用私有别名与回退。私有默认值不得盖住宿主；同模式自定义皮肤变更也必须触发探针。
- 主题缺失白名单的 token 只能在页面本地推导/回退，不能宣称与宿主逐 token 完全一致；差异单独列出。
- Toast 的 LiquidGlassFilter 仅作为传递依赖复制，不把宿主液态玻璃效果伪装成已解耦能力。
- Emoji 复制完整现有 SVG 子集和映射，验证真实图片加载；系统 emoji 回退单列。
- 全组件预览分原语、表单、导航、浮层、资产/动效；交互状态由页面持有，每个卡片隔离错误。
- 真实 webview 内运行受限自测：点击页面自有测试入口、读取 DOM 与几何，记录 portal parent、fixed、视口边界、滚动后位置/关闭行为。不把合成 DOM 事件当成真实鼠标/键盘验收。
- 顶部主题控件默认仅改变当前预览，另用换肤工坊做真实宿主浅深/皮肤切换测试；两条路径明确区分。

## 已有证据的复核

旧版收到真实 webview 的 React 探针报告，但存在以下缺陷，需重测：

1. 探针只在 light/dark 改变时采样，同为 light 的自定义皮肤变化被漏记。
2. `:root[data-theme=dark]` 直接定义公开 token，可能比注入 `:root` 更高优先级，导致深色皮肤被默认值覆盖。
3. bundle 版本字符串次数不能证明单 React；改用 Rollup 实际模块列表与 external 契约核对。
4. 并未完成 portal 实测；不能用静态源码或浏览器结果替代。

## 最终结论（2026-11-14 实测，Finch 1.8.1 prod）

### 命题 1 · React 能否在小程序 webview 渲染 —— 通过

- 证据：安装后的 `finch-ui-lab` 在真实 guest 内挂载 36 张组件卡片（`mountedCards: 36`），ErrorBoundary 捕获 0 个组件错误，`runtimeErrors` 为空。
- 构建：`dist/panel` 1698 个模块，`npm run typecheck`、`npx @finchtoys/minitools doctor .` 均无问题。

### 命题 2 · 主题错配 —— 浅深切换：通过；换肤工坊自定义皮肤：通过（白名单内 token）；白名单外 token：不通过（只能本地推导）

真实宿主切换记录（guest 内 400ms 轮询，`--finch-*` 读值 + 组件实际 computed 色）：

| 时间 (UTC) | 宿主外观 | 读到 `--finch-accent` | Button primary 实际背景 |
|---|---|---|---|
| 13:50:30 | 自定义「薄荷晨光」(light) | `#0e9f6e` | `rgb(14,159,110)` |
| 13:50:51 | 内置 light | `#0db664` 混合 | `color(srgb 0.05 0.71 0.39)` |
| 13:51:44 | 内置 dark | `#30c48d` 80% | `color(srgb 0.15 0.61 0.44)` |
| 13:52:14 | 自定义「UI Lab 深紫验证」(dark) | `#8047c4` | `rgb(128,71,196)` |
| 13:54:50 | 自定义浅蓝 (light) | `#2f6fed` | `rgb(47,111,237)` |
| 13:54:52 | 自定义薄荷 (light) | `#0e9f6e` | `rgb(14,159,110)` |
| 13:54:55 | 自定义青 (dark) | `#0d9488` | `rgb(13,148,136)` |

- 同模式内自定义皮肤互换（dark→深紫、浅蓝→薄荷，`--finch-theme-mode` 不变）都被跟上了，也就是旧探针的盲区已经补上。组件实际颜色在约 1 秒内（两次轮询）完成过渡，中间出现的 `oklab(...)` 读值是 CSS transition 的中间帧。
- 缺口（不通过）：宿主只注入白名单 token。`--bg-inset`、`--danger-dim`、`--text-inverse`、`--ease-*`、`--duration-*` 等不在白名单内，库内只能用 `--ui-fallback-*` 加 `color-mix` 从白名单值推导。例如深紫皮肤下 inset 推导为 `color(srgb 0.197 0.144 0.265)`，`danger-dim` 固定为默认值，不跟随皮肤。要做到逐 token 一致，需要宿主扩大注入白名单。
- 已知偏差：Tooltip/HoverCard 的反色底是硬编码 `#1f2937/#f4f6f8`，按 `data-theme` 切换，不跟随自定义皮肤的色相（主仓本来就是这样，不属于抽包带来的问题）。

### 命题 3 · Tailwind 预编译产物里任意值 utility 是否真实存在 —— 通过（156/156）

- 核对方法：`npm run verify` 运行 `verify-build.mjs`，用 Babel 解析全部组件副本的 `.ts/.tsx`，收集 className 里的 `[...]` 任意值候选，再到 `dist/ui/style.css` 里逐条找**转义后的精确选择器，并且要有非空声明**。结果写入 `build-verification.json`。凡是 `]${` 这种模板拼接写法一律判失败（Tailwind 扫描不到）。
- 结果：第一轮 156 条里缺 1 条，`hover:!text-[var(--ui-primary)]!`，来源是主仓 `src/renderer/ui/InlineSelect.tsx` 的 `hover:!text-[var(--primary)]!` —— 前后同时写了 `!`，Tailwind 不生成规则，InlineSelect 悬停变主色这个设计意图在主仓里也一直没生效。已按“组件修正也同步回主仓”的要求修掉多余的那个尾 `!`，现在 156 条全部存在，verify 退出码 0。

### 命题 4 · 双 React 与体积 —— 单 React：通过；体积：需要优化，不阻塞

- `dist/ui/modules.json` 里打进去的 React 模块数为 0；库的 import 只有 `react`、`react/jsx-runtime`、`react-dom`、`lucide-react`（全部 external）。
- `dist/panel/modules.json` 里 React 和 ReactDOM 的包根各只有 1 个。核验时会先去掉 Rollup CJS 代理 id 的 `\0` 前缀和 `?commonjs-*` 后缀，否则会误报出两个根。
- 体积：库 JS 1,326 kB（gzip 339 kB），库 CSS 77.5 kB（gzip 13 kB）；消费端 JS 1,517 kB（gzip 404 kB）。**库 JS 里约 1.2 MB 来自 Emoji 的 561 个内联 SVG**（`import.meta.glob` eager）。正式发包时应把 Emoji 拆成独立入口，或改成按需 URL 资产。

## Portal / 浮层实测（真实 guest，合成 DOM 事件，共 3 轮）

| 检查项 | 结论 | 依据 |
|---|---|---|
| Menu portal 到 body、`position:fixed`、在视口内 | 通过 (3/3) | 例如 `x48 y217 w87 h135` |
| Menu 逃出 `overflow` 裁切（elementFromPoint 命中菜单） | 通过 (3/3) | hit=BUTTON（菜单项） |
| Menu 随嵌套滚动跟随锚点 | 通过 (2/3) | 菜单与锚点相对位移恒为 28px；第 1 轮失败是测试本身的问题（整页滚动导致锚点移出视口后被 clamp） |
| DropdownSelect portal | 通过（需要显式传 `portal`） | 源码默认 `portal=false`，不传时是绝对定位，会被滚动容器裁切 |
| Tooltip portal | **需舜子肉眼确认** | 3 轮都没抓到节点：组件只认 `:focus-visible` 焦点和 React 合成 mouseenter，脚本派发的事件触发不了，属于自动化的限制，不能据此判定组件失败 |
| Tooltip 滚动即关闭 | 通过（符合设计） | `remaining:false` |
| HoverCard portal / 跟随滚动 | 通过 (1/3)，其余 2 轮不稳定 | 第 3 轮锚点被滚到顶部，卡片被 clamp 在 y=8，所以“跟随”判失败。这是视口 clamp 加测试顺序造成的，不是 portal 失效 |
| ModalShell portal 铺满 guest 视口 | 通过 (3/3) | 尺寸与 guest 视口一致 (521×843) |
| ModalShell Esc 只关闭最上层 | 通过 (3/3) | 嵌套弹窗关一层后剩 1 层 |
| ConfirmDialog 弹出 alertdialog | 通过 (2/3) | 第 3 轮前一个 Modal 的 Esc 动画未结束就点了按钮；需肉眼复核 |
| Toast 单例渲染出卡片 | 通过 (3/3) | 卡片在右下角视口内 |
| ToggleSwitch 状态切换 | 通过 | aria-checked true→false |
| Emoji 用 SVG 而非系统字体 | 通过 | data URI SVG，naturalWidth 150 |

结构性边界：portal 的容器是 guest 的 `document.body`，所以浮层**不可能越出小程序 webview 的物理边界**。窄面板里，靠近边缘的菜单只会被 clamp 在 webview 内，不会盖到 Finch 主窗口上。

## 不通过 / 有边界的组件清单

| 组件 | 类别 | 原因 |
|---|---|---|
| Toast | 全局单例 + 宿主耦合 | 依赖 `registerToastApi` 全局单例，每个 webview 需要自己挂 `ToastViewport` 并注册；液态玻璃背景依赖宿主的 `LiquidGlassFilter` SVG filter，guest 里退化为普通背景 |
| Emoji / EmojiText | 资产管线 | 依赖 Vite `import.meta.glob` 内联 561 个 Twemoji SVG，非 Vite 消费端无法使用；体积约 1.2 MB；`.twemoji` 的尺寸样式原属宿主 CSS，需随包复制 |
| ModalShell（设置类变体） | 宿主 CSS 缺口 | `.settingsModalShell` 样式在宿主 `settings.css`，已手工复制进库，属于需要正式归属的 CSS |
| Tooltip / HoverCard | 主题 | 反色底硬编码，不跟随自定义皮肤色相 |
| DropdownSelect | portal 默认值 | 默认不走 portal，放进滚动容器会被裁切，使用方要记得传 `portal` |
| 所有组件 | 主题白名单 | 白名单外 token 只能推导，不能与宿主逐值一致 |
| 所有浮层 | portal 边界 | 无法越出 webview 物理边界 |

## 需舜子肉眼确认（一次性验收步骤）

入口：在 Finch 里让我执行“打开 UI Lab”（`finch_ui_lab action=open`），右侧面板会出现 **Finch UI Lab**。顶部分段控件保持选在 **“跟随宿主”**。

1. **Tooltip**：在「浮层 → Tooltip / HoverCard」卡片里，鼠标悬停 top/bottom/left/right 四个按钮。应在对应方向出现深色小提示框，并且不被卡片边框裁掉；悬停 “disabled Tooltip” 不出现任何提示。再按 Tab 把焦点移到按钮上，也应出现提示。
2. **HoverCard**：悬停第二行四个按钮，应出现带长文本的浮卡，靠近面板右缘时翻转或收进面板内。
3. **嵌套滚动跟随**：在卡片下方的灰色小滚动区里点“测试菜单”，菜单打开后在小滚动区里滚动滚轮，菜单应贴着按钮一起移动；悬停“测试 HoverCard”后滚动，浮卡应跟随；Tooltip 应在滚动时关闭。
4. **自定义皮肤**：打开换肤工坊，选任意一款自定义皮肤（例如紫色）。UI Lab 顶部“当前读取值”里的 `--finch-accent` 应在 1 秒内变成新色，Button primary 和开关轨道也同步变色；再切回内置深色，全部恢复。
5. **InlineSelect 悬停**：在「表单 → InlineSelect」里悬停触发文字，现在**会**变成主色（双 `!` 已修）；如果不变色就说明回归了。
6. **ConfirmDialog**：点卡片里的“确认对话框”按钮，应出现带确认/取消按钮的对话框，Esc 可以关闭。
7. **本轮四个修正**：
   - ListRow：鼠标悬停第一行，右侧“操作”应单行贴在行尾，不再竖排换行。
   - ModalShell：点“打开 Modal”，表头分割线通栏，正文与标题左对齐（同一 px-5 左线）。
   - Alert：info 卡现在和下面三张同档 —— 同样的描边透明度、同样的 10% 填充，只有色相不同；标题和图标是同家族的低饱和蓝，不再是刺眼的亮蓝。
   - TextArea：默认没有右下角拖拽手柄，最后一个“按需可拖”示例才有；Input/TextArea 文字都是 500 字重。

## 本轮修正记录（2026-11-14，含主仓同步）

舜子看过第一版预览后提了五个视觉问题。它们不是抽包带来的，而是主仓组件本身就有的缺陷，所以都改在主仓、再机械同步到副本：

| 问题 | 根因 | 修改点 | 验证 |
|---|---|---|---|
| ListRow 右侧操作竖排换行 | 右侧浮层是绝对定位在 `minWidth:20px` 的容器里，文字默认可换行，宽度被容器卡住就逐字换行 | `src/renderer/ui/ListRow.tsx` 浮层加 `whitespace-nowrap` | 真实 Chromium 计算值 `white-space:nowrap`、高 21px；截图中悬停后“操作”单行 |
| ModalShell 内容间距不对 | `ModalShell` 本身不给内边距（表头内部 px-5/py-3，正文 padding 归调用方），预览却给整个 shell 加了 16px padding，把表头和分割线一起推离边缘 | `panel/Overlays.tsx` 只给正文 `px-5 pt-4 pb-5`，去掉 `.lab-modal` 的 padding | 实测标题与正文 x 坐标一致，分割线通栏 |
| Alert info 与另外三张不同调 | `--info` 原本是低饱和灰蓝（浅 `#5fafc9` / 深 `#7ba3bf`），填充给到 30%，且图标和标题都继承 `--text-secondary`，四张卡里只有它是灰的 | 中间试过一版高饱和亮蓝（浅 `#0c6dd3` / 深 `#7cafe9`，另加 `--info-border`），单看够蓝但跟 warning/error/success 不是一档，已废弃。最终把 info 拉回和另外三个语义色同一套配方：`--info` 低饱和蓝（浅 `#5d8fc0` / 深 `#7a9ec7`）、`--info-strong` 文字档（浅 `#3c6b9a` / 深等于 `--info`）、`--info-soft` 改成 10% 软填充（原来是 30%），描边回到 `color-mix(--info 34%)`，与 `--danger` / `--warning` / `--positive` 完全同构；`webviewTheme.ts` 注入 `--finch-info-strong` | 浅/深两套截图：照片里四张卡的描边透明度、填充力度、标题明度一致，只有色相不同 |
| TextArea 默认带拖放手柄 | 基类写了 `resize-y` | `src/renderer/ui/TextArea.tsx` 改为 `resize-none`，需要时由调用方传 `style={{resize:"vertical"}}`（行内样式优先级高于类，不靠 Tailwind 出词顺序） | 副本初测 6 个 textarea：5 个 `resize:none`、opt-in 那个 `vertical` |
| Input / TextArea 字重不对 | `INPUT_BASE_CLASS` 没有字重 | 加 `font-medium`，`Input`、`TextArea`、`InputSelect` 同时生效 | 计算值均为 `500` |

顺手修掉的：`InlineSelect` 的 `hover:!text-[var(--primary)]!` 尾双 `!`，使得 `verify` 从「156 缺 1」变成 156/156 通过。

配色改到第二版后，浏览器里实测（`--ui-info-strong` 解析值 + Alert 标题计算色）：深色 `#7a9ec7`、浅色 `#3c6b9a`，描边分别为 `color-mix(--info 34%)`，填充 10%，与 warning / error / success 同档。

注意宿主注入的差异：正在运行的 Finch 1.8.1 注入的 `--finch-info` 还是更早的老值，`--finch-info-strong` 也要等 App 重新构建才会注入。所以现在在「跟随宿主」下，info 描边和填充已经跟着新 token 走，标题蓝会等新构建才变成 `#7a9ec7`；想立刻看最终效果就切到「本页深色 / 本页浅色」，那两条路径不吃宿主注入。

已跑：`npm run typecheck`（主仓）、`npx vitest run src/renderer/ui src/i18n/auditSourceTree.test.ts`（16 文件 68 测试全过，含 CSS 架构与 i18n 冻结基线）、副本 `sync + typecheck + build + verify + doctor`。

浏览器的验证只能拿副本产物跑（`python3 -m http.server` 起在 `dist/`，开 `/panel/index.html`）；真实宿主只能靠 guest 内的快照和截屏，页面没有注入 `--finch-*` 时会落到 fallback，所以颜色两侧都要看。

## 产物与复现

- 小程序：`examples/extensions/finch-ui-lab/`，通过 `MiniTool add` 安装到 `~/finchnest/.finch/extensions/finch-ui-lab`。
- 复现命令：`npm run sync && npm run build && npm run verify`，三项都应为 0 退出。
- 更新已打开的面板必须先 `MiniTool disable` 再 `enable`。单纯 `reload` 后，旧 webview 仍然运行旧 bundle。
- 测试结束后宿主外观已恢复为内置 dark。
