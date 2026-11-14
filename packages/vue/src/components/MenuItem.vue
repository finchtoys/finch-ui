<script setup lang="ts">
/** Vue 3 port of MenuPanel / MenuItem / MenuSeparator from library/components/Menu.tsx. */
import { useAttrs } from "vue";
import { menuItemClassName, menuSeparatorClassName } from "@shared/classes";

const props = withDefaults(
  defineProps<{
    /** MenuItem */
    active?: boolean;
    danger?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
    /** MenuSeparator */
    separator?: boolean;
  }>(),
  { active: false, danger: false, className: "", type: "button", separator: false },
);

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
</script>

<template>
  <div v-if="props.separator" :class="menuSeparatorClassName(props.className)" v-bind="attrs" />
  <button
    v-else
    :type="props.type"
    :class="menuItemClassName({ active: props.active, danger: props.danger, className: props.className })"
    v-bind="attrs"
  >
    <slot name="icon" />
    <slot />
    <span v-if="$slots.trailing" class="ml-auto flex shrink-0 items-center">
      <slot name="trailing" />
    </span>
  </button>
</template>
