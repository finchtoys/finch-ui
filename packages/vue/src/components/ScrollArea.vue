<script setup lang="ts">
/**
 * Vue port of ScrollArea.tsx — native scrolling `appScrollbar` box with the
 * edge fade expressed as a CSS mask driven by scroll position.
 *
 * Simplification vs React (documented in the README): the React version runs a
 * ResizeObserver + rAF loop and can host horizontal orientation; this one tracks
 * scroll position only, which is all the current call sites (menus, dialogs) use.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { scrollAreaClassName } from "@shared/classes";

const props = withDefaults(
  defineProps<{
    orientation?: "vertical" | "horizontal";
    fadeTop?: boolean;
    fadeBottom?: boolean;
    topFadeSize?: number;
    bottomFadeSize?: number;
    maxHeight?: number;
  }>(),
  { orientation: "vertical", fadeTop: true, fadeBottom: true, topFadeSize: 12, bottomFadeSize: 16 },
);

const scroller = ref<HTMLElement | null>(null);
const atTop = ref(true);
const atBottom = ref(true);

function measure() {
  const el = scroller.value;
  if (!el) return;
  atTop.value = el.scrollTop <= 1;
  atBottom.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
}

const maskStyle = computed(() => {
  if (props.orientation !== "vertical") return undefined;
  const masks: string[] = [];
  if (props.fadeTop && !atTop.value) masks.push(`linear-gradient(to bottom, transparent 0, #000 ${props.topFadeSize}px)`);
  if (props.fadeBottom && !atBottom.value) {
    masks.push(`linear-gradient(to top, transparent 0, #000 ${props.bottomFadeSize}px)`);
  }
  return masks.length ? { maskImage: masks.join(","), WebkitMaskImage: masks.join(",") } : undefined;
});

watch([atTop, atBottom], () => measure());

onMounted(() => {
  measure();
  scroller.value?.addEventListener("scroll", measure, { passive: true });
});

onBeforeUnmount(() => scroller.value?.removeEventListener("scroll", measure));
</script>

<template>
  <div
    ref="scroller"
    :class="scrollAreaClassName({ orientation: props.orientation })"
    :style="[{ maxHeight: props.maxHeight ? `${props.maxHeight}px` : undefined }, maskStyle]"
  >
    <slot />
  </div>
</template>
