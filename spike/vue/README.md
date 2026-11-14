# Vue 3 spike — 5 组件 + 并排实测

用 Vue 3（Composition API + SFC）重写了 `Button` / `Input` / `ToggleSwitch` / `ModalShell` / `Menu`，
并与 `library/components/*.tsx` 原件在同一张页面里逐项对比。

两个框架现在吃**同一份** `library/styles/classes.ts`（命题 4 方案 A 已落地），所以这里的对比同时也是那条共享路径的回归测试。

结论与数据：[`docs/vue-spike-findings.md`](../../docs/vue-spike-findings.md)。

## 边界

- spike 代码只在 `spike/vue/`；`library/` 的改动只有命题 4 的共享模块迁移（见 findings §5.4），`lab/` 未改动，不发包。
- 样式表**直接复用** `library/dist/style.css`（预编译产物）。构建后仍然是 77,589 字节、逐字节相同 —— Vue 侧没有跑 Tailwind。
- React 与 Vue 各自带自己的运行时（这是对比台，不是产品包），Vite 里用 alias 把两边的 `react` 钉到同一份，否则 hooks 会因双 React 实例直接崩。

## 目录

```
src/shared/classes.ts      re-export shim → library/styles/classes.ts
src/vue/*.vue              Vue 组件本体；XIcon / StarIcon 是 lucide-react 图标的 DOM 替身
src/vue/ButtonDriftControl.vue  负向对照：删掉一个 font-medium! 的 Vue 按钮
src/harness/react-trees.tsx     用 React 原件搭场景
src/harness/vue-trees.ts        同场景的 Vue 版本（只在这里用 h()，组件本身是 SFC）
src/harness/registry.ts         41 个场景定义 + 交互脚本
src/harness/metrics.ts          57 条 CSS 属性 + 几何 + class + 属性的采样
src/harness/run.ts              页面内跑批：单挂 → 采集 → 交互 → 再采集 → 卸载
scripts/compare.mjs             headless Chromium：样式/行为 + 真实鼠标键盘 + 截图逐字节比对
```

## 跑

```bash
npm install
npm run build      # vite build → dist/（CSS 应与 library/dist/style.css 逐字节相同）
npm run report     # 浅色 + 深色两轮
npm run typecheck  # vue-tsc
```

`npm run report` 需要本机有 Chromium。默认按顺序找
`~/Library/Caches/ms-playwright/chromium-*/chrome-mac-*/…`，找不到再用 `/Applications/Google Chrome.app`，
也可以用 `CHROMIUM_PATH=/path/to/chrome npm run report` 指定。

产物：

- `report/comparison-light.json`、`report/comparison-dark.json` —— 全量采样、差异、行为事实
- `report/shots/{light,dark}/<scenario>--{react,vue}.png` —— 每对截图（逐字节比对，相同也留档，方便出事时看）

## 看结果

```bash
node -e "const r=require('./report/comparison-light.json'); console.log(r.summary)"
```

`summary.scenariosWithDiffs === 0`、`controlDetected === true`、`probeDiffs === 0`、
`pixelDiffScenarios` 为空 —— 四项同时成立才算通过。`controlDetected` 是必须项：它证明探针能发现漂移
（负向对照里 500→400 的字重差必须被抓到）。

## 没覆盖

真实 Finch webview 内、`v-model` 输入语义、hover/active 全矩阵、无障碍树、`MenuSubmenu`。
详见 findings §7。
