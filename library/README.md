# @finchtoys/ui

Finch 主程序内置的 React 组件库，抽出来给小程序作者用 —— 面板观感和 Finch 本体一致，并且**自动跟随用户的浅色/深色主题与自定义皮肤**。

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

## 三条硬性要求

1. **必须引 `@finchtoys/ui/style.css`**。样式已预编译，**你的项目不需要装 Tailwind**，也不要加 Tailwind 插件去扫它。
2. **`react` / `react-dom` 是 peerDependency**，由你的页面提供。页面里出现两份 React 会直接坏掉。
3. **`lucide-react` 也是 peerDependency**，组件内部用它出图标。

## 主题

组件读 `var(--finch-X, var(--ui-fallback-X))`：

- **在 Finch 里**：宿主自动往小程序 webview 注入 `--finch-*`，浅/深切换和换肤工坊的自定义皮肤都自动跟随，你不用写任何代码。
- **脱离 Finch 独立用**：取不到 `--finch-*` 时走包内自带默认值，不会裸奔。但**深色档要你自己挂属性** —— 库的深色判定是 `[data-theme="dark"]`，在祖先元素上设好它，否则永远是浅色。

需要自己写自定义样式时，用 `var(--finch-accent, #0db664)` 这种带 fallback 的写法；能用的是 `--finch-*` 前缀那批，`--bg-*` / `--text-*` 这些 Finch 内部名在 webview 里取不到值。

## 用之前要知道的边界

| 组件 | 注意 |
|---|---|
| `Toast` | 全局单例，每个页面自己挂 `ToastViewport` 并注册；液态玻璃背景依赖宿主 SVG filter，在小程序里退化为普通背景 |
| `DropdownSelect` | **默认不走 portal**，放进滚动容器会被裁切 —— 记得显式传 `portal` |
| `Emoji` / `EmojiText` | 依赖 Vite `import.meta.glob` 内联 561 个 Twemoji SVG（约 1.2 MB），非 Vite 项目暂时用不了 |
| `Tooltip` / `HoverCard` | 反色底是硬编码色，不跟随自定义皮肤色相 |
| 所有浮层 | portal 容器是 webview 自己的 `document.body`，**浮层出不了小程序面板的物理边界**，靠边缘会被 clamp 在面板内 |

想看组件实际长什么样，装 **[Finch UI Lab](https://www.npmjs.com/package/@finchtoys/finch-ui-lab)** 预览小程序：

```bash
npx @finchtoys/minitools add @finchtoys/finch-ui-lab
```

完整仓库与验证记录：https://github.com/finchtoys/finch-ui

## 许可

MIT
