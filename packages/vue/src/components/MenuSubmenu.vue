<script setup lang="ts">
/**
 * Vue port of MenuSubmenu.tsx — a menu panel anchored to the side of its
 * trigger row, with viewport collision flipping and the same 1.8 centering the
 * React version uses for tall account menus.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { menuStateClose, menuStateOpen } from "@lib/components/menuState";
import { MENU_OUT_DURATION, clampPosition, menuPanelClassName, menuPanelStyle } from "@shared/classes";

const props = withDefaults(
  defineProps<{
    open: boolean;
    getTrigger?: () => HTMLElement | null;
    side?: "left" | "right";
    verticalAlign?: "center" | "top";
    gap?: number;
    gutter?: number;
    positioningMinHeight?: number;
    className?: string;
  }>(),
  { side: "right", verticalAlign: "center", gap: 0, gutter: 18, positioningMinHeight: 0, className: "" },
);

const emit = defineEmits<{ close: []; hoverIn: []; hoverOut: [] }>();

const panelEl = ref<HTMLElement | null>(null);
const position = ref<{ left: number; top: number } | null>(null);
const closing = ref(false);
const visible = ref(false);
let registered = false;
let closeTimer: ReturnType<typeof setTimeout> | null = null;
let frame = 0;
let observer: ResizeObserver | null = null;

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
      closing.value = false;
      visible.value = true;
      return;
    }
    if (!visible.value) return;
    closing.value = true;
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      closing.value = false;
      visible.value = false;
      position.value = null;
      unregister();
    }, MENU_OUT_DURATION);
  },
  { immediate: true },
);

function update() {
  const panel = panelEl.value;
  const trigger = props.getTrigger?.() ?? null;
  if (!panel || !trigger) return;

  const menuRect = panel.getBoundingClientRect();
  const positioningHeight = Math.max(menuRect.height, props.positioningMinHeight);
  const triggerRect = trigger.getBoundingClientRect();
  const rightLeft = triggerRect.right + props.gap;
  const leftLeft = triggerRect.left - menuRect.width - props.gap;
  const hasRightSpace = rightLeft + menuRect.width <= window.innerWidth - props.gutter;
  const hasLeftSpace = leftLeft >= props.gutter;
  const preferredLeft =
    props.side === "left"
      ? hasLeftSpace || !hasRightSpace
        ? leftLeft
        : rightLeft
      : hasRightSpace || !hasLeftSpace
        ? rightLeft
        : leftLeft;

  const triggerCenterY = triggerRect.top + triggerRect.height / 1.8;
  const preferredTop =
    props.verticalAlign === "top" ? triggerRect.top : triggerCenterY - menuRect.height / 1.8;

  position.value = {
    left: clampPosition(preferredLeft, props.gutter, window.innerWidth - menuRect.width - props.gutter),
    top: clampPosition(preferredTop, props.gutter, window.innerHeight - positioningHeight - props.gutter),
  };
}

function attach() {
  detach();
  update();
  frame = requestAnimationFrame(update);
  observer = new ResizeObserver(update);
  if (panelEl.value) observer.observe(panelEl.value);
  const trigger = props.getTrigger?.() ?? null;
  if (trigger) observer.observe(trigger);
  window.addEventListener("resize", update);
  window.addEventListener("scroll", update, true);
}

function detach() {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  observer = null;
  window.removeEventListener("resize", update);
  window.removeEventListener("scroll", update, true);
}

watch([visible, closing], ([value, isClosing]) => {
  if (value && !isClosing) attach();
  else detach();
}, { flush: "post" });

onMounted(() => {
  if (visible.value && !closing.value) attach();
});

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer);
  detach();
  unregister();
});

const panelClass = computed(() => menuPanelClassName(closing.value, props.className));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="panelEl"
      data-menu-panel="true"
      data-menu-submenu="true"
      :class="panelClass"
      :style="menuPanelStyle(position)"
      @mouseenter="$emit('hoverIn')"
      @mouseleave="$emit('hoverOut')"
    >
      <slot />
    </div>
  </Teleport>
</template>
