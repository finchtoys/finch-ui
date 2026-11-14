<script setup lang="ts">
import { CHIP_REMOVE_BUTTON_CLASS, actionChipClassName, chipClassName } from "@shared/classes";
import LucideIcon from "../icons/LucideIcon.vue";

const props = withDefaults(
  defineProps<{
    /** Render a `<button>` (ActionChip) instead of a `<span>`. */
    actionable?: boolean;
    removeLabel?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  }>(),
  { actionable: false, removeLabel: "Remove", type: "button", disabled: false },
);

const emit = defineEmits<{ remove: []; click: [event: MouseEvent] }>();
</script>

<template>
  <button
    v-if="props.actionable"
    :type="props.type"
    :disabled="props.disabled"
    :class="actionChipClassName()"
    @click="emit('click', $event)"
  >
    <slot name="leading" />
    <slot />
    <slot name="trailing" />
  </button>
  <span v-else :class="chipClassName()">
    <slot name="leading" />
    <slot />
    <slot name="trailing" />
    <button
      v-if="$slots.remove"
      :class="CHIP_REMOVE_BUTTON_CLASS"
      :title="props.removeLabel"
      type="button"
      @click.stop="emit('remove')"
    >
      <LucideIcon name="x" :size="13" />
    </button>
  </span>
</template>
