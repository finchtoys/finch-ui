<script setup lang="ts">
/**
 * Renders a lucide icon from generated node data. Attribute order/values match
 * what lucide-react emits, so the DOM (and therefore the class-parity smoke)
 * stays aligned with the React components.
 */
import { computed } from "vue";
import { ICON_NODES } from "./nodes";

const props = withDefaults(
  defineProps<{ name: keyof typeof ICON_NODES | string; size?: number; strokeWidth?: number; className?: string }>(),
  { size: 24, strokeWidth: 2, className: "" },
);

const definition = computed(() => ICON_NODES[props.name]);
const children = computed(() => definition.value?.children ?? []);
const svgClass = computed(() => `lucide lucide-${definition.value?.canonical ?? props.name} ${props.className}`.trim());
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="props.strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="svgClass"
    aria-hidden="true"
  >
    <component :is="tag" v-for="([tag, attrs], index) in children" :key="index" v-bind="attrs" />
  </svg>
</template>
