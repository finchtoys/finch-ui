<script setup lang="ts">
import { computed } from "vue";
import {
  CHECKBOX_CHECK_SIZE,
  CHECKBOX_DESC_CLASS,
  CHECKBOX_LABEL_GROUP_CLASS,
  checkBoxClassName,
  checkBoxDotClassName,
  checkBoxIndicatorClassName,
  checkBoxLabelClassName,
} from "@shared/classes";
import type { CheckBoxRound, CheckBoxSize } from "@shared/classes";
import LucideIcon from "../icons/LucideIcon.vue";

const props = withDefaults(
  defineProps<{
    active: boolean;
    disabled?: boolean;
    title?: string;
    size?: CheckBoxSize;
    round?: CheckBoxRound;
  }>(),
  { disabled: false, size: "md", round: "full" },
);

const emit = defineEmits<{ toggle: [] }>();

const indicatorClass = computed(() =>
  checkBoxIndicatorClassName({ size: props.size, round: props.round, active: props.active }),
);
const labelClass = computed(() => checkBoxLabelClassName({ size: props.size, active: props.active }));

function onClick(event: MouseEvent) {
  event.stopPropagation();
  emit("toggle");
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    emit("toggle");
  }
}
</script>

<template>
  <span
    role="button"
    :tabindex="props.disabled ? -1 : 0"
    :aria-pressed="props.active"
    :title="props.title"
    :class="checkBoxClassName({ disabled: props.disabled })"
    @click="onClick"
    @keydown="onKeyDown"
  >
    <span :class="indicatorClass">
      <template v-if="props.active">
        <slot name="active">
          <span v-if="props.round === 'full'" :class="checkBoxDotClassName(props.size)" />
          <LucideIcon v-else name="check" :size="CHECKBOX_CHECK_SIZE[props.size]" :stroke-width="3" />
        </slot>
      </template>
      <slot v-else name="inactive" />
    </span>
    <span v-if="$slots.default || $slots.desc" :class="CHECKBOX_LABEL_GROUP_CLASS">
      <span v-if="$slots.default" :class="labelClass"><slot /></span>
      <span v-if="$slots.desc" :class="CHECKBOX_DESC_CLASS"><slot name="desc" /></span>
    </span>
  </span>
</template>
