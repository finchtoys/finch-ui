<script setup lang="ts">
/**
 * Vue port of Tooltip.tsx.
 *
 * React clones the trigger element to attach handlers; Vue wraps the slot in a
 * `display:contents` box and measures its first element child instead, so the
 * trigger's layout and classes are untouched.
 */
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { isAnyMenuOpen, subscribeMenuState } from "@lib/components/menuState";
import {
  TOOLTIP_CONTENT_CLASS,
  TOOLTIP_OUT_DURATION,
  tooltipClassName,
  tooltipPosition,
} from "@shared/classes";
import type { TooltipAlign, TooltipPlacement } from "@shared/classes";

const props = withDefaults(
  defineProps<{
    content?: string;
    placement?: TooltipPlacement;
    align?: TooltipAlign;
    delay?: number;
    disabled?: boolean;
    dismissOnTriggerClick?: boolean;
    gap?: number;
    /** Controlled visibility (bypasses hover handling). */
    open?: boolean;
    anchorRect?: DOMRect | null;
    className?: string;
    /** Show even without `content` (rich content through the #content slot). */
    rich?: boolean;
  }>(),
  {
    placement: "bottom",
    align: "center",
    delay: 300,
    disabled: false,
    dismissOnTriggerClick: true,
    gap: 6,
    rich: false,
  },
);

const anchorWrap = ref<HTMLElement | null>(null);
const bubble = ref<HTMLDivElement | null>(null);
const hoverVisible = ref(false);
const closing = ref(false);
const position = ref<{ left: number; top: number } | null>(null);

let openTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;
let suppress = false;

const isControlled = computed(() => props.open !== undefined);
const hasContent = computed(() => props.rich || Boolean(props.content));
const visible = computed(
  () => !props.disabled && hasContent.value && (isControlled.value ? Boolean(props.open) : hoverVisible.value),
);

/** display:contents wrapper has no box; measure the first real child. */
function triggerElement(): HTMLElement | null {
  const wrap = anchorWrap.value;
  if (!wrap) return null;
  return (wrap.firstElementChild as HTMLElement | null) ?? wrap;
}

function schedule() {
  if (!visible.value || closing.value) return;
  const anchor = triggerElement()?.getBoundingClientRect() ?? props.anchorRect;
  if (!anchor || !bubble.value) return;
  position.value = tooltipPosition(props.placement, anchor, bubble.value.getBoundingClientRect(), props.gap, props.align);
}

function clearTimers() {
  if (openTimer) clearTimeout(openTimer);
  if (closeTimer) clearTimeout(closeTimer);
  openTimer = closeTimer = null;
}

function open() {
  if (props.disabled || !hasContent.value || suppress || isAnyMenuOpen()) return;
  if (openTimer) clearTimeout(openTimer);
  openTimer = setTimeout(() => {
    closing.value = false;
    hoverVisible.value = true;
  }, props.delay);
}

function close() {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  if (!hoverVisible.value) return;
  closing.value = true;
  closeTimer = setTimeout(() => {
    closing.value = false;
    hoverVisible.value = false;
    position.value = null;
  }, TOOLTIP_OUT_DURATION);
}

function onPointerDown(event: PointerEvent) {
  if (!props.dismissOnTriggerClick && triggerElement()?.contains(event.target as Node)) return;
  suppress = true;
  close();
  setTimeout(() => (suppress = false), 500);
}

// Menu open/close suppresses tooltips so they never sit on top of a menu.
function onMenuStateChange() {
  if (isAnyMenuOpen()) {
    clearTimers();
    suppress = true;
    closing.value = true;
    closeTimer = setTimeout(() => {
      closing.value = false;
      hoverVisible.value = false;
      position.value = null;
    }, TOOLTIP_OUT_DURATION);
  } else {
    setTimeout(() => (suppress = false), 200);
  }
}

function onScrollOrResize() {
  close();
}

watch(visible, (value) => {
  if (value) {
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", onScrollOrResize, true);
  } else {
    window.removeEventListener("resize", schedule);
    window.removeEventListener("scroll", onScrollOrResize, true);
    position.value = null;
  }
});

watch(
  () => [props.disabled, props.content, props.rich],
  () => {
    if (!props.disabled && hasContent.value) return;
    clearTimers();
    hoverVisible.value = false;
    closing.value = false;
    position.value = null;
  },
);

watch(
  () => props.open,
  (value) => {
    if (value) {
      closing.value = false;
    } else {
      position.value = null;
    }
  },
);

// Must run after the bubble exists; `flush: "post"` gives real measurements
// and lands before paint (React relies on useLayoutEffect for the same thing).
watch(
  [visible, closing, () => props.placement, () => props.align, () => props.gap, () => props.anchorRect],
  () => {
    if (!visible.value || closing.value) return;
    if (!bubble.value) return;
    schedule();
  },
  { flush: "post" },
);

const unsubscribeMenu = subscribeMenuState(onMenuStateChange);

onBeforeUnmount(() => {
  clearTimers();
  unsubscribeMenu();
});
</script>

<template>
  <span
    ref="anchorWrap"
    style="display: contents"
    @mouseenter="open"
    @mouseleave="close"
    @focusin="open"
    @focusout="close"
  >
    <slot />
  </span>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="bubble"
      :class="tooltipClassName({ placement: props.placement, closing, className: props.className ?? '' })"
      :style="{
        position: 'fixed',
        left: `${position?.left ?? 0}px`,
        top: `${position?.top ?? 0}px`,
        visibility: position ? 'visible' : 'hidden',
        pointerEvents: 'none',
        zIndex: 9999,
      }"
    >
      <div :class="TOOLTIP_CONTENT_CLASS"><slot name="content">{{ props.content }}</slot></div>
    </div>
  </Teleport>
</template>
