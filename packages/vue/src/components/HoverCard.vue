<script setup lang="ts">
/**
 * Vue port of HoverCard.tsx — same wrapper strategy as Tooltip.vue
 * (display:contents trigger box, first element child is the anchor).
 */
import { computed, onBeforeUnmount, ref, watch } from "vue";
import {
  HOVER_CARD_CONTENT_CLASS,
  HOVER_CARD_OUT_DURATION,
  hoverCardClassName,
  hoverCardPosition,
} from "@shared/classes";
import type { HoverCardPlacement } from "@shared/classes";

const props = withDefaults(
  defineProps<{
    placement?: HoverCardPlacement;
    open?: boolean;
    delay?: number;
    disabled?: boolean;
    gap?: number;
    className?: string;
    rich?: boolean;
  }>(),
  { placement: "bottom", delay: 250, disabled: false, gap: 8, rich: true },
);

const wrapEl = ref<HTMLElement | null>(null);
const cardEl = ref<HTMLElement | null>(null);
const hoverVisible = ref(false);
const closing = ref(false);
const position = ref<{ left: number; top: number; placement: HoverCardPlacement } | null>(null);

let openTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;
let frame = 0;
let observer: ResizeObserver | null = null;

const isControlled = computed(() => props.open !== undefined);
const visible = computed(
  () => !props.disabled && (isControlled.value ? Boolean(props.open) : hoverVisible.value),
);

function triggerElement(): HTMLElement | null {
  const wrap = wrapEl.value;
  if (!wrap) return null;
  return (wrap.firstElementChild as HTMLElement | null) ?? wrap;
}

function update() {
  const trigger = triggerElement();
  if (!trigger || !cardEl.value) return;
  position.value = hoverCardPosition(
    props.placement,
    trigger.getBoundingClientRect(),
    cardEl.value.getBoundingClientRect(),
    props.gap,
  );
}

function attachMeasurement() {
  update();
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(update);
  observer?.disconnect();
  observer = new ResizeObserver(update);
  const trigger = triggerElement();
  if (trigger) observer.observe(trigger);
  if (cardEl.value) observer.observe(cardEl.value);
  window.addEventListener("resize", update);
  window.addEventListener("scroll", update, true);
}

function detachMeasurement() {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  observer = null;
  window.removeEventListener("resize", update);
  window.removeEventListener("scroll", update, true);
}

function open() {
  if (props.disabled) return;
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
    if (!isControlled.value) position.value = null;
  }, HOVER_CARD_OUT_DURATION);
}

watch(
  [visible, closing, () => props.placement, () => props.gap],
  ([value, isClosing]) => {
    if (!value || isClosing) {
      detachMeasurement();
      return;
    }
    attachMeasurement();
  },
  { flush: "post" },
);

watch(
  () => props.open,
  (value) => {
    if (value) closing.value = false;
    else position.value = null;
  },
);

onBeforeUnmount(() => {
  if (openTimer) clearTimeout(openTimer);
  if (closeTimer) clearTimeout(closeTimer);
  detachMeasurement();
});
</script>

<template>
  <span
    ref="wrapEl"
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
      ref="cardEl"
      :class="hoverCardClassName({ placement: position?.placement ?? props.placement, closing, className: props.className ?? '' })"
      :style="{
        position: 'fixed',
        left: `${position?.left ?? -10000}px`,
        top: `${position?.top ?? -10000}px`,
        visibility: position ? 'visible' : 'hidden',
        pointerEvents: 'none',
        zIndex: 9999,
      }"
    >
      <div :class="HOVER_CARD_CONTENT_CLASS"><slot name="content" /></div>
    </div>
  </Teleport>
</template>
