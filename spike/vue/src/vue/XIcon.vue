<template>
  <!-- Replicates lucide-react's <X size={17} /> DOM exactly (same attributes,
       same class names, same aria-hidden), so the icon can be compared too. -->
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
    :class="`lucide lucide-x ${props.className}`.trim()"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number; strokeWidth?: number; className?: string }>(), {
  size: 24,
  strokeWidth: 2,
  className: "",
});
</script>
