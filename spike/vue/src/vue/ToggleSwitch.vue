<script setup lang="ts">
/**
 * Vue 3 port of library/components/ToggleSwitch.tsx.
 *
 * Note the shape difference that survives the port: ToggleSwitch is built on
 * *inline styles computed in JS* (track width/height, thumb offsets, transition
 * strings), not on utility classes. That is the part a class-constant sharing
 * proposal does NOT cover — see docs/vue-spike-findings.md.
 */
import { computed } from "vue";
import {
  TOGGLE_SWITCH_TRACK_BORDER,
  toggleSwitchClassName,
  toggleSwitchGeometry,
  toggleSwitchTrackColor,
} from "@shared/classes";

const props = withDefaults(
  defineProps<{
    checked: boolean;
    size?: "sm" | "md";
    disabled?: boolean;
    className?: string;
  }>(),
  { size: "md", disabled: false, className: "" },
);

const emit = defineEmits<{ change: []; click: [event: MouseEvent] }>();

const geo = computed(() => toggleSwitchGeometry(props.size));

const rootClass = computed(() =>
  toggleSwitchClassName({ disabled: props.disabled, className: props.className }),
);

const rootStyle = computed(() => {
  const { trackW, trackH } = geo.value;
  return {
    width: `${trackW}px`,
    height: `${trackH}px`,
    backgroundColor: toggleSwitchTrackColor(props.checked, props.disabled),
    border: TOGGLE_SWITCH_TRACK_BORDER,
    transition: "background-color 200ms ease",
    opacity: props.disabled ? 0.5 : 1,
  };
});

const thumbStyle = computed(() => {
  const { trackW, thumb, pad } = geo.value;
  return {
    width: `${thumb}px`,
    height: `${thumb}px`,
    backgroundColor: "var(--ui-fg-primary)",
    left: `${props.checked ? trackW - pad - thumb : pad}px`,
    transform: "translateY(-50%)",
    transition: "left 200ms cubic-bezier(0.22, 1, 0.36, 1)",
  };
});

function onClick(event: MouseEvent) {
  event.stopPropagation();
  if (!props.disabled) emit("change");
  emit("click", event);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="props.checked"
    :disabled="props.disabled"
    :class="rootClass"
    :style="rootStyle"
    @click="onClick"
  >
    <span class="absolute top-1/2 rounded-full shadow-sm" :style="thumbStyle" />
  </button>
</template>
