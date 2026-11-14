import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * 液态玻璃（Liquid Glass）SVG filter 定义与位移图同步。
 *
 * 原理（参考 nav-liquid-glass-demo）：
 *  backdrop-filter 支持引用 SVG `<filter>`（`url(#id) blur(...)`）。filter 内用
 *  `feDisplacementMap` 按一张「位移图」对背景做几何扭曲，再分 R/G/B 三路以不同
 *  幅度位移后 screen 混合，产生色散 —— 这就是「折射玻璃」而非普通磨砂。
 *
 *  位移图按目标元素的实际像素尺寸生成（data URI SVG）：R 通道编码水平位移、
 *  B 通道编码垂直位移，两者各自只在贴近边缘的一圈「过渡带」内从中点连续渐变
 *  到满幅值，过渡带以外维持中点（真正静止）—— 这样四个角上的位移矢量精确
 *  指向「背离中心」，形成径向的鼓起/拉伸，而不是一整条边缘固定方向平移。
 *  元素尺寸变化（窗口缩放、输入多行等）时由 ResizeObserver 防抖重建。
 *  详细推导见 buildGlassMap 函数上方注释。
 *
 * 该组件只负责产出 Composer / 返回底部按钮这两个「单例」目标的 filter 定义
 * 并保持位移图同步（用选择器 + 轮询查找，因为同一时刻页面上只会存在一个
 * 实例）。Toast 这种「同一时刻可能同时存在多个、且尺寸各不相同」的场景不
 * 适合共用一份 filter/位移图——见下方 useLiquidGlassInstance，由 Toast 自己
 * 按每个实例单独生成 filter id + 位移图（Toast.tsx 中使用）。
 *
 * 是否启用由 `:root[data-liquid-glass="true"]` 上的 CSS 规则决定
 * （见 composer.css / message.css / styles.css 里的 .toastCard 规则）。
 */

export const LIQUID_GLASS_FILTER_IDS = {
  composer: "finch-liquid-glass-composer",
  scroll: "finch-liquid-glass-scroll",
} as const;

export interface GlassTarget {
  /** 目标元素选择器，仅供 LiquidGlassFilter 内部的选择器轮询模式使用；
   *  按 ref 单实例同步（useLiquidGlassInstance）时不读这个字段。 */
  selector?: string;
  filterId: string;
  mapId: string;
  /** feDisplacementMap 位移幅度。负值 = 边缘从「元素之外」拉入内容（向外鼓
   *  起/拉伸的液态玻璃感）；正值方向相反。三路色差在该值上 +3 / +6。 */
  scale: number;
  /** 水平方向：位移从边缘的满幅值连续渐变到中心「静止区」所占的宽度比例
   *  （0-0.5，相对元素自身宽度，非 min(w,h)）。这是真正决定「像不像玻璃」的
   *  旋钮——带越宽，边缘拉伸越连续越柔和；带太窄，露出来的渐变已经接近
   *  饱和值、几乎不变化，看起来就像一整条边缘平移了位置而不是被拉伸。 */
  borderRatio: number;
  /** 垂直方向顶部过渡带宽度比例（0-0.5，相对元素自身高度）：控制顶部
   *  反向折射带的宽度与强度。扁元素（如 Composer）必须比水平方向更大，
   *  否则纵向的过渡带太窄，只有左右方向看得出拉伸。 */
  topInsetRatio: number;
  /** 垂直方向底部过渡带宽度比例：独立于顶部，避免输入文字落入底部
   *  拉伸带。输入区在元素下部时调小此值，文字不会被折射拉伸变形。 */
  bottomInsetRatio: number;
  /** 位移图整体柔化的模糊半径（px）。抹平渐变分段处的轻微硬转折，让扭曲更
   *  连续；元素越小要用越小的值，否则会把过渡带本身直接糊掉。 */
  blur: number;
}

const COMPOSER_TARGET: GlassTarget = {
  selector: ".composerShell:not(.composerShell--concise), .composerShell--concise .composerShell__draft",
  filterId: LIQUID_GLASS_FILTER_IDS.composer,
  mapId: "finch-liquid-glass-composer-map",
  scale: -70,
  borderRatio: 0.02,
  topInsetRatio: 0.14,
  bottomInsetRatio: 0,
  blur: 3,
};

const SCROLL_TARGET: GlassTarget = {
  selector: ".conversationScrollButton",
  filterId: LIQUID_GLASS_FILTER_IDS.scroll,
  mapId: "finch-liquid-glass-scroll-map",
  scale: -26,
  borderRatio: 0.24,
  topInsetRatio: 0.1,
  bottomInsetRatio: 0.1,
  blur: 1.5,
};

/** Toast 卡片的基础参数，直接沿用 Composer（数值一致，按用户要求）。
 *  filterId/mapId 是占位——Toast.tsx 里每个实例会各自换成按 toast.id 派生
 *  的唯一 id，因为同一时刻可能同时存在好几个高度不同的 Toast，不能共用
 *  一份位移图（那样除了被追踪的那个，其余会用错误尺寸被拉伸/错位）。 */
export const TOAST_GLASS_BASE: Omit<GlassTarget, "selector"> = {
  filterId: "finch-liquid-glass-toast-base",
  mapId: "finch-liquid-glass-toast-base-map",
  scale: COMPOSER_TARGET.scale,
  borderRatio: COMPOSER_TARGET.borderRatio,
  topInsetRatio: COMPOSER_TARGET.topInsetRatio,
  bottomInsetRatio: COMPOSER_TARGET.bottomInsetRatio,
  blur: COMPOSER_TARGET.blur,
};

const TARGETS: GlassTarget[] = [COMPOSER_TARGET, SCROLL_TARGET];

/** 把过渡带宽度比例转成 SVG 渐变 stop 的百分比偏移，夹在合理范围内
 *  （太小则带子几乎不存在，太大则「静止区」被吃掉、中心也开始扭曲）。 */
function neutralStopPct(ratio: number): number {
  return Math.max(1, Math.min(45, Math.round(ratio * 100)));
}

/** 从元素的 computed border-radius 解析出圆角半径（px）。
 *  999px/百分比视为胶囊（min(w,h)/2）；位移图的渐变 rect 必须用元素实际
 *  圆角，否则四角折射带与元素角形状错位。 */
function readRadius(el: Element, w: number, h: number): number {
  const css = getComputedStyle(el).borderRadius;
  const first = css.split(" ")[0];
  const px = parseFloat(first);
  if (Number.isFinite(px) && px > 0) return Math.min(px, Math.min(w, h) / 2);
  return Math.min(w, h) / 2;
}

/**
 * 位移图核心改版：不再用「整宽/整高线性渐变 + 一块几乎不透明的高光遮住中间」，
 * 而是让每个轴的渐变本身只在边缘的过渡带内完成 0（静止/中点值 127）→ 满幅值
 * 的渐变，过渡带以外直接维持在中点 127（真正静止，不是「几乎不变」）。
 *
 * 好处：
 *  1) 过渡带内是连续渐变而不是接近饱和的一小段，视觉上是「连续拉伸」而不是
 *     「一条边整体挪了位置」；
 *  2) 四个角上 R/B 通道天然分别取各自轴向的极值，位移矢量精确指向「背离中心」
 *     的对角方向，形成真正的径向鼓起/拉伸，而不是一个固定方向的剪切。
 *
 * R 通道（水平位移）与 B 通道（垂直位移）分别用纯红/纯蓝渐变各自表达，两者
 * 混合用 difference（红层的 B=0、蓝层的 R=0），混合后互不干扰、天然独立。
 */
function buildGlassMap(w: number, h: number, radius: number, target: GlassTarget): string {
  const xNeutral = neutralStopPct(target.borderRatio);
  const yTopNeutral = neutralStopPct(target.topInsetRatio);
  const yBottomNeutral = neutralStopPct(target.bottomInsetRatio);
  const svg =
    '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="gx" x1="0%" y1="0%" x2="100%" y2="0%">' +
    '<stop offset="0%" stop-color="rgb(255,0,0)"/>' +
    '<stop offset="' + xNeutral + '%" stop-color="rgb(127,0,0)"/>' +
    '<stop offset="' + (100 - xNeutral) + '%" stop-color="rgb(127,0,0)"/>' +
    '<stop offset="100%" stop-color="rgb(0,0,0)"/>' +
    '</linearGradient>' +
    '<linearGradient id="gy" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="rgb(0,0,255)"/>' +
    '<stop offset="' + yTopNeutral + '%" stop-color="rgb(0,0,127)"/>' +
    '<stop offset="' + (100 - yBottomNeutral) + '%" stop-color="rgb(0,0,127)"/>' +
    '<stop offset="100%" stop-color="rgb(0,0,0)"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="black"/>' +
    '<g style="filter:blur(' + target.blur + 'px)">' +
    '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="' + radius + '" fill="url(#gx)"/>' +
    '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="' + radius + '" fill="url(#gy)" style="mix-blend-mode:difference"/>' +
    '</g>' +
    '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/** 三路色差共用的 feDisplacementMap + feColorMatrix 片段。 */
function displacementBranch(target: GlassTarget, extra: number, channel: "red" | "green" | "blue") {
  const matrix =
    channel === "red"
      ? "1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
      : channel === "green"
        ? "0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
        : "0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0";
  return (
    <>
      <feDisplacementMap
        in="SourceGraphic"
        in2="map"
        xChannelSelector="R"
        yChannelSelector="B"
        scale={target.scale + extra}
        result={"d" + channel}
      />
      <feColorMatrix in={"d" + channel} type="matrix" values={matrix} result={channel} />
    </>
  );
}

/**
 * 一个目标对应的完整 `<filter>` 定义，抽出来给 LiquidGlassFilter（Composer/
 * 返回底部按钮）和 Toast 各自的每实例 filter 复用，避免两处维护同一份结构。
 */
export function GlassFilterDef({ target }: { target: GlassTarget }) {
  return (
    <filter
      id={target.filterId}
      colorInterpolationFilters="sRGB"
      // SVG filter 默认可用区域只比元素大 10%（-10% ~ 110%），对矮的
      // Composer/按钮来说只有 6~9px 余量。scale 调大后单路最大位移可达
      // (|scale|+6)*0.5，很容易超出这个余量而被硬裁切——尤其是垂直方向
      // （元素矮），这就是「顶部折射看起来不对/发生偏移」的根因之一。
      // 这里显式放宽到 -60% ~ 160%，给足位移采样的余量。
      x="-60%"
      y="-60%"
      width="220%"
      height="220%"
    >
      <feImage id={target.mapId} preserveAspectRatio="none" result="map" />
      {displacementBranch(target, 0, "red")}
      {displacementBranch(target, 3, "green")}
      {displacementBranch(target, 6, "blue")}
      <feBlend in="red" in2="green" mode="screen" result="rg" />
      <feBlend in="rg" in2="blue" mode="screen" result="output" />
      <feGaussianBlur in="output" stdDeviation="0.7" />
    </filter>
  );
}

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

/** 按元素当前实际像素尺寸重建对应 `<feImage>`（位移图）。
 *  不能原地 setAttribute 改尺寸/href：Chromium 对 backdrop-filter 引用的 SVG
 *  filter 链路做了结果缓存，元素尺寸大幅跳变时（比如展开权限/提问卡片把
 *  Composer 撑高数倍）单纯改属性经常触发不了完整的失效重算，导致玻璃内容
 *  停留在旧尺寸下的错位状态，且不会随后续尺寸变化自愈。这里整体重建
 *  `<feImage>` 节点（remove + 重新插入），把它当成全新资源，强制
 *  backdrop-filter 重新渲染。宽高必须显式设为元素像素尺寸：在 SVG filter
 *  里 100% 是相对 filter region（-60%~160%，即 220% 元素宽）而非元素本身，
 *  否则位移图会被拉伸错位。 */
export function rebuildGlassMap(el: Element, target: GlassTarget): void {
  const oldMap = document.getElementById(target.mapId) as SVGFEImageElement | null;
  const filterEl = oldMap?.parentElement as SVGFilterElement | null;
  if (!oldMap || !filterEl) return;
  const rect = el.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  const uri = buildGlassMap(w, h, readRadius(el, w, h), target);

  const nextMap = document.createElementNS(SVG_NS, "feImage") as SVGFEImageElement;
  nextMap.setAttribute("id", target.mapId);
  nextMap.setAttribute("x", "0");
  nextMap.setAttribute("y", "0");
  nextMap.setAttribute("width", String(w));
  nextMap.setAttribute("height", String(h));
  nextMap.setAttribute("preserveAspectRatio", "none");
  nextMap.setAttribute("result", "map");
  nextMap.setAttribute("href", uri);
  nextMap.setAttributeNS(XLINK_NS, "href", uri);
  filterEl.replaceChild(nextMap, oldMap);
}

/**
 * 单实例同步 hook：给 ref 指向的元素配一份「专属」位移图（`target.mapId` /
 * `target.filterId` 需要是这个实例独有的，调用方负责派生唯一 id，比如
 * Toast.tsx 按 `toast.id` 拼）。挂载时立即同步一次（不等轮询），此后用
 * ResizeObserver 防抖跟随尺寸变化重建。用于「同一时刻可能同时存在多个、
 * 尺寸各不相同」的场景（比如堆叠的 Toast），跟 LiquidGlassFilter 里
 * Composer/返回底部按钮那种选择器轮询的单例模式是互补关系。
 */
export function useLiquidGlassInstance(target: GlassTarget, ref: RefObject<Element | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let rebuildTimer: number | undefined;
    // 挂载即同步，不等 ResizeObserver 的第一次回调（大多数浏览器首次
    // observe 也会立即回调一次，但不能依赖这个行为，显式同步一次更可靠）。
    rebuildGlassMap(el, target);
    const observer = new ResizeObserver(() => {
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(() => rebuildGlassMap(el, target), 140);
    });
    observer.observe(el);
    return () => {
      window.clearTimeout(rebuildTimer);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.filterId, target.mapId, ref]);
}

/**
 * 渲染隐藏 SVG defs（Composer 与返回底部按钮两个单例 filter），并保持位移图
 * 与目标元素尺寸同步。挂载于主窗口根部，filter 定义常驻，由 CSS 按需引用。
 */
export function LiquidGlassFilter() {
  useEffect(() => {
    // 记录当前正在观察的真实 DOM 节点（而不是一个"是否处理过"的布尔标记）。
    // Composer 等目标元素会随路由切换被 React 卸载/重新挂载（比如离开/回到
    // Session），卸载后旧的 ResizeObserver 只是在监视一个已经从文档树摘
    // 除的死节点、永远不会再回调；如果只用一次性的 synced 标记，重新挂载时
    // 会被当成"已经处理过"而跳过重新绑定，导致窗口在目标元素不可见期间发生
    // 缩放后，回来看到的位移图仍是按旧尺寸生成的、和当前实际尺寸对不上，
    // 表现为玻璃内容错位。这里改为持续轮询 + 按元素引用是否变化来判断是否
    // 需要重新绑定，而不是只处理一次。
    const trackedEls = new Map<string, Element>();
    const observers = new Map<string, ResizeObserver>();
    const rebuildTimers = new Map<string, number>();
    let pollTimer: number | undefined;

    const tryObserve = (target: GlassTarget) => {
      if (!target.selector) return;
      const el = document.querySelector(target.selector);
      const tracked = trackedEls.get(target.mapId);
      // 元素引用没变（还是同一个在监视的节点）：什么都不用做。
      if (el === tracked && el) return;
      // 元素消失（路由切换导致卸载）：断开旧 observer，等下次轮询它重新出现。
      if (!el) {
        observers.get(target.mapId)?.disconnect();
        observers.delete(target.mapId);
        trackedEls.delete(target.mapId);
        return;
      }
      // 元素是新的（首次挂载，或卸载后又重新挂载出一个新节点）：先清理可能
      // 还残留、指向旧节点的 observer，再绑定新节点并立即按当前尺寸重建。
      observers.get(target.mapId)?.disconnect();
      // 尺寸变化防抖重建，避免每帧重栅格化位移图。每个目标独立计时，互不覆盖。
      const observer = new ResizeObserver(() => {
        window.clearTimeout(rebuildTimers.get(target.mapId));
        const timer = window.setTimeout(() => rebuildGlassMap(el, target), 140);
        rebuildTimers.set(target.mapId, timer);
      });
      observer.observe(el);
      observers.set(target.mapId, observer);
      trackedEls.set(target.mapId, el);
      rebuildGlassMap(el, target);
    };

    // 持续轮询（不再在"全部找到过一次"后停止）：目标元素可能尚未挂载（如
    // Home 视图下没有 Composer），也可能在挂载后又被卸载、重新挂载出新节点
    // （切换路由离开/回到 Session），必须每次都重新核对引用是否还有效。
    const tryObserveAll = () => {
      for (const target of TARGETS) tryObserve(target);
    };
    tryObserveAll();
    pollTimer = window.setInterval(tryObserveAll, 500);

    return () => {
      window.clearInterval(pollTimer);
      for (const timer of rebuildTimers.values()) window.clearTimeout(timer);
      rebuildTimers.clear();
      for (const observer of observers.values()) observer.disconnect();
      observers.clear();
      trackedEls.clear();
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", overflow: "hidden", pointerEvents: "none" }}
    >
      <defs>
        {TARGETS.map((target) => (
          <GlassFilterDef key={target.filterId} target={target} />
        ))}
      </defs>
    </svg>
  );
}
