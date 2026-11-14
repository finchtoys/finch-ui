<script setup lang="ts">
import { SEGMENTED_CONTROL_CLASS, segmentedIconClassName, segmentedItemClassName } from "@shared/classes";

interface SegmentOption {
  value: string;
  label: string;
  icon?: string;
}

const props = defineProps<{ options: SegmentOption[]; value: string }>();
const emit = defineEmits<{ change: [value: string] }>();
</script>

<template>
  <div role="group" :class="SEGMENTED_CONTROL_CLASS">
    <button
      v-for="option in props.options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="props.value === option.value"
      :class="segmentedItemClassName(props.value === option.value)"
      @click="emit('change', option.value)"
    >
      <!-- Options carry an icon name (see README: slots are not usable inside a
           data-driven option list). -->
      <span v-if="option.icon" :class="segmentedIconClassName(props.value === option.value)" />
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>
