<script setup lang="ts">
import {
  STEP_SLIDER_FILL_CLASS,
  STEP_SLIDER_LABELS_ROW_CLASS,
  STEP_SLIDER_ROOT_CLASS,
  STEP_SLIDER_THUMB_CLASS,
  STEP_SLIDER_TRACK_CLASS,
  stepSliderDotClassName,
  stepSliderLabelClassName,
} from "@shared/classes";

const props = withDefaults(
  defineProps<{ steps: string[]; labels: Record<string, string>; value: string; showFill?: boolean }>(),
  { showFill: true },
);

const emit = defineEmits<{ change: [value: string] }>();

function pctFor(index: number) {
  return (index / (props.steps.length - 1)) * 100;
}
</script>

<template>
  <div :class="STEP_SLIDER_ROOT_CLASS" role="group">
    <div :class="STEP_SLIDER_LABELS_ROW_CLASS">
      <button
        v-for="(step, index) in props.steps"
        :key="step"
        type="button"
        :class="stepSliderLabelClassName(props.value === step)"
        :style="{ left: `${pctFor(index)}%` }"
        @click="emit('change', step)"
      >
        {{ props.labels[step] }}
      </button>
    </div>
    <div :class="STEP_SLIDER_TRACK_CLASS">
      <div
        v-if="props.showFill"
        :class="STEP_SLIDER_FILL_CLASS"
        :style="{ width: `${pctFor(props.steps.indexOf(props.value))}%` }"
      />
      <div :class="STEP_SLIDER_THUMB_CLASS" :style="{ left: `${pctFor(props.steps.indexOf(props.value))}%` }" />
      <button
        v-for="(step, index) in props.steps"
        :key="step"
        type="button"
        :aria-pressed="props.value === step"
        :class="stepSliderDotClassName(props.value === step)"
        :style="{ left: `${pctFor(index)}%` }"
        @click="emit('change', step)"
      />
    </div>
  </div>
</template>
