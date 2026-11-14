<script setup lang="ts">
/**
 * Vue 3 port of library/components/ToggleSwitch.tsx.
 *
 * ToggleSwitch is built on *inline styles computed in JS*, not only utility
 * classes, so the shared module also owns those values (as `"42px"` strings —
 * Vue does not append `px` to numbers, React does). Both frameworks now call
 * the same `toggleSwitchTrackStyle` / `toggleSwitchThumbStyle`.
 */
import { computed } from "vue";
import {
  TOGGLE_SWITCH_THUMB_CLASS,
  toggleSwitchClassName,
  toggleSwitchThumbStyle,
  toggleSwitchTrackStyle,
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

const rootClass = computed(() =>
  toggleSwitchClassName({ disabled: props.disabled, className: props.className }),
);

const rootStyle = computed(() =>
  toggleSwitchTrackStyle({ size: props.size, checked: props.checked, disabled: props.disabled }),
);

const thumbStyle = computed(() => toggleSwitchThumbStyle({ size: props.size, checked: props.checked }));

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
    <span :class="TOGGLE_SWITCH_THUMB_CLASS" :style="thumbStyle" />
  </button>
</template>
