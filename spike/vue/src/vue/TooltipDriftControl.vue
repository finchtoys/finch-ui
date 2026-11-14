<script setup lang="ts">
/**
 * SENSITIVITY CONTROL (not a product component).
 *
 * Mirrors the shipped Tooltip's DOM and classes but offsets the bubble by 8px.
 * If the harness cannot see this, its "zero drift" verdicts on overlays are
 * worthless — the same reasoning as ButtonDriftControl for class strings.
 */
import { computed } from "vue";
import { TOOLTIP_CONTENT_CLASS, tooltipClassName, tooltipPosition } from "@shared/classes";
import type { TooltipPlacement } from "@shared/classes";

const props = withDefaults(
  defineProps<{ content?: string; placement?: TooltipPlacement; anchorRect?: DOMRect | null }>(),
  { placement: "bottom", content: "" },
);

const position = computed(() => {
  const anchor = props.anchorRect;
  if (!anchor) return null;
  const width = 96;
  const height = 32;
  const base = tooltipPosition(props.placement, anchor, { width, height }, 6, "center");
  return { left: base.left, top: base.top + 8 };
});
</script>

<template>
  <span style="display: contents">
    <slot />
  </span>
  <Teleport to="body">
    <div
      :class="tooltipClassName({ placement: props.placement })"
      :style="{
        position: 'fixed',
        left: `${position?.left ?? 0}px`,
        top: `${position?.top ?? 0}px`,
        visibility: position ? 'visible' : 'hidden',
        pointerEvents: 'none',
        zIndex: 9999,
      }"
    >
      <div :class="TOOLTIP_CONTENT_CLASS">{{ props.content }}</div>
    </div>
  </Teleport>
</template>
