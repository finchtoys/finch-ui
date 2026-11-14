<script setup lang="ts">
/**
 * Vue 3 port of library/components/Menu.tsx — MenuPanel / MenuItem /
 * MenuSeparator / MenuPopover.
 *
 * Framework-neutral pieces are imported, not re-derived:
 *  - menuState.ts (module singleton: open count + closeAll broadcast) is plain
 *    TS, so both frameworks share one counter in the same document.
 *  - menuPosition() / menuPanelClassName() / menuPanelStyle() from shared/classes.
 *
 * Vue-specific work: React's useLayoutEffect/useEffect dependencies become
 * `watch(..., { flush: "post" })`; the mount/unmount count guard becomes
 * onBeforeUnmount. Everything else is a 1:1 translation.
 */
import { onBeforeUnmount, ref, watch } from "vue";
import {
  menuStateClose,
  menuStateOpen,
  subscribeMenuCloseAll,
} from "@lib/components/menuState";
import {
  MENU_OUT_DURATION,
  menuPanelClassName,
  menuPanelStyle,
  menuPosition,
} from "@shared/classes";
import type { MenuPlacement, MenuPosition } from "@shared/classes";

const props = withDefaults(
  defineProps<{
    open: boolean;
    /** Vue idiom: a getter instead of React's RefObject. */
    getAnchor?: () => HTMLElement | null;
    anchorPoint?: { x: number; y: number } | null;
    placement?: MenuPlacement;
    gap?: number;
    gutter?: number;
    className?: string;
    panelStyle?: Record<string, string | number>;
  }>(),
  {
    placement: "bottom-start",
    gap: 0,
    gutter: 12,
    className: "",
    anchorPoint: null,
  },
);

const emit = defineEmits<{ close: [] }>();

const panelEl = ref<HTMLDivElement | null>(null);
const position = ref<MenuPosition | null>(null);
const isClosing = ref(false);
const visible = ref(false);
let registered = false;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function register() {
  if (registered) return;
  menuStateOpen();
  registered = true;
}
function unregister() {
  if (!registered) return;
  menuStateClose();
  registered = false;
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      register();
      isClosing.value = false;
      visible.value = true;
      return;
    }
    if (!visible.value) return;
    isClosing.value = true;
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      isClosing.value = false;
      visible.value = false;
      position.value = null;
      unregister();
    }, MENU_OUT_DURATION);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer);
  unregister();
});

// Positioning — Vue equivalent of React's useLayoutEffect. flush:"post" runs
// after the panel is in the DOM (so offsetWidth/offsetHeight are real) and
// before paint (so no 0,0 flash).
watch(
  [() => props.open, visible, isClosing, () => props.placement, () => props.gap, () => props.gutter],
  (_value, _old, onCleanup) => {
    if (!visible.value || isClosing.value || !props.open) {
      if (!visible.value) position.value = null;
      return;
    }

    const updatePosition = () => {
      const panel = panelEl.value;
      if (!panel) return;
      // offsetWidth/offsetHeight stay stable while the scale animation runs.
      const menuRect = { width: panel.offsetWidth, height: panel.offsetHeight };
      const anchor = props.getAnchor?.() ?? null;
      let next: MenuPosition | null = null;

      if (anchor) {
        next = menuPosition(props.placement, anchor.getBoundingClientRect(), menuRect, props.gap, props.gutter);
      } else if (props.anchorPoint) {
        const point = props.anchorPoint;
        next = menuPosition(
          props.placement,
          { left: point.x, right: point.x, top: point.y, bottom: point.y },
          menuRect,
          props.gap,
          props.gutter,
        );
      }

      if (!next) return;
      if (position.value?.left === next.left && position.value?.top === next.top) return;
      position.value = next;
    };

    updatePosition();

    let anchorFrame = 0;
    const trackAnchor = () => {
      updatePosition();
      anchorFrame = requestAnimationFrame(trackAnchor);
    };
    if (props.getAnchor) anchorFrame = requestAnimationFrame(trackAnchor);

    const resizeObserver = new ResizeObserver(updatePosition);
    if (panelEl.value) resizeObserver.observe(panelEl.value);

    window.addEventListener("resize", updatePosition);
    const handleScroll = props.getAnchor ? updatePosition : () => emit("close");
    window.addEventListener("scroll", handleScroll, true);

    onCleanup(() => {
      if (anchorFrame) cancelAnimationFrame(anchorFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    });
  },
  { flush: "post" },
);

// Outside pointerdown + Escape.
watch(
  () => props.open,
  (open, _old, onCleanup) => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelEl.value?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-menu-panel='true']")) return;
      if (props.getAnchor?.()?.contains(target)) return;
      emit("close");
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") emit("close");
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    const unsubscribeCloseAll = subscribeMenuCloseAll(() => emit("close"));

    onCleanup(() => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      unsubscribeCloseAll();
    });
  },
  { immediate: true },
);

const computedStyle = () => ({ ...props.panelStyle, ...menuPanelStyle(position.value) });

defineExpose({ panelEl, position });
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="panelEl"
      data-menu-panel="true"
      :class="menuPanelClassName(isClosing, props.className)"
      :style="computedStyle()"
    >
      <slot />
    </div>
  </Teleport>
</template>
