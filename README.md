# Finch UI

Finch 内置的 React 组件库，抽出来给小程序（mini tool / mini program）作者用 —— 让你做出来的面板和 Finch 本身长得一样、跟着用户的主题和自定义皮肤一起变。

```bash
npm i @finchtoys/ui react react-dom lucide-react
```

```tsx
import { Button, Input, ToggleSwitch } from "@finchtoys/ui";
import "@finchtoys/ui/style.css";

export function Panel() {
  return (
    <div className="p-4 flex flex-col gap-3">
      <Input placeholder="搜索" />
      <Button variant="primary">保存</Button>
      <ToggleSwitch checked aria-label="启用" />
    </div>
  );
}
```

**必须一起引 `style.css`**，组件样式全在里面，已经预编译好，**你的项目不需要装 Tailwind**。

## 仓库结构

| 目录 | 说明 |
|---|---|
| `library/` | `@finchtoys/ui` 组件库源码，44 个组件 |
| `lab/` | **Finch UI Lab** 小程序：在真实 webview 里逐个组件展示所有状态与变体，可当场切主题核对 |
| `skills/finch-ui/` | 给 AI 用的技能文件，让 agent 写小程序面板时直接用对组件 |
| `docs/` | 抽包方案与实测验证记录 |

```bash
npm install
npm run build      # 先库后面板
npm run verify     # 校验预编译 CSS 与单 React
npm run typecheck
```

## 主题

组件读 `--finch-*` CSS 变量。Finch 宿主会自动往小程序 webview 注入这套变量，**你不需要手动设**：

- 浅色 / 深色切换 → 自动跟随
- 用户在换肤工坊换自定义皮肤 → 自动跟随（约 1 秒内过渡）
- 脱离 Finch 单独打开页面 → 包自带默认主题，不会裸奔

**已知边界**：宿主只注入白名单内的 token。`--bg-inset`、`--danger-dim`、`--text-inverse`、`--ease-*`、`--duration-*` 不在白名单里，库内用 `color-mix` 从白名单值推导 —— 也就是说这些位置能跟着主题大方向走，但做不到和宿主逐值一致。

## 用之前要知道的几件事

| 组件 | 注意 |
|---|---|
| `Toast` | 全局单例。每个页面要自己挂 `ToastViewport` 并注册，不能跨页面共享 |
| `DropdownSelect` | 默认**不走** portal，放进滚动容器会被裁切 —— 记得显式传 `portal` |
| `Emoji` / `EmojiText` | 依赖 Vite `import.meta.glob` 内联 561 个 Twemoji SVG（约 1.2 MB）。非 Vite 项目暂时用不了，正在拆成独立入口 |
| `Tooltip` / `HoverCard` | 反色底是硬编码色，不跟随自定义皮肤的色相（Finch 主程序本来也这样） |
| 所有浮层 | portal 容器是 webview 自己的 `document.body`，**浮层不可能越出小程序面板的物理边界**，靠边缘时会被 clamp 在面板内 |

## 状态

`0.1.0`。组件源码目前是从 Finch 主仓 `src/renderer/ui/` **显式复制**过来的（`npm run sync` 生成，需要本地有一份 finch 检出，用 `FINCH_REPO` 指定路径），主程序暂时还没反过来依赖这个包。

也就是说：**现在库和主程序是两份副本**，改动会漂移。收敛到主程序反向依赖是下一步，见 `docs/finch-ui-extraction-plan.md`。

## 许可

MIT
