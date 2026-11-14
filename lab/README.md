# Finch UI Lab

在真实 Finch webview 里把 `@finchtoys/ui` 的**全部组件、全部状态与变体**摆出来的预览小程序。想知道某个组件长什么样、跟随主题对不对、或者怀疑自己用错了，先跑它看一眼，比翻源码快。

## 装进 Finch

```bash
npx @finchtoys/minitools add @finchtoys/finch-ui-lab
```

装完**默认是禁用状态**，要手动启用：

1. 打开 Finch 的**工具箱（Toolcase）**，找到 **Finch UI Lab**；
2. 打开启用开关，顺手看一眼它申请的权限（这个小程序不需要任何权限）；
3. 启用后，在会话右侧的**小程序启动器**（Panel 的 `+` 菜单）里点 **Finch UI Lab**，或者在工具箱详情页直接打开。

## 离线安装（不联网也能装）

拿到 `finch-ui-lab-<version>.fapp` 后，**直接拖进 Finch 主窗口**（或双击，前提是 Finch 注册了 `.fapp` 关联）。会弹安装确认，装完同样是禁用状态，需要你在工具箱里启用。

## 页面里能做什么

- **顶部分段控件**切换「跟随宿主 / 浅色 / 深色」。保持「跟随宿主」时，你在 Finch 外观设置里切主题、或者在换肤工坊换一套自定义皮肤，页面里的组件会当场跟着变；顶部还会实时显示读到的 `--finch-accent` 等关键值，方便核对。
- 按**基础 / 表单 / 浮层**分区，每个组件都给了默认、hover、disabled、各 size、各 variant。
- 浮层区可以真点：菜单能开、模态能弹、Esc 只关最上层、嵌套滚动区里能看浮层跟不跟随。

## 自己从源码构建

```bash
git clone https://github.com/finchtoys/finch-ui.git
cd finch-ui && npm install && npm run build
npx @finchtoys/minitools add ./lab
```

开发时想改完即生效，用软链安装：

```bash
npx @finchtoys/minitools add ./lab --dev
```
