<script setup lang="ts">
import { computed, ref } from "vue";
import {
  INPUT_ERROR_TEXT_CLASS,
  INPUT_HINT_CLASS,
  INPUT_LABEL_CLASS,
  INPUT_SELECT_ROOT_CLASS,
  SELECT_TRIGGER_SIZE,
  inputSelectChevronClassName,
  inputSelectInputClassName,
  inputSelectShellClassName,
  selectChevronIconClassName,
} from "@shared/classes";
import type { InputRound, InputSize, InputVariant } from "@shared/classes";
import LucideIcon from "../icons/LucideIcon.vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    hint?: string;
    error?: string;
    mono?: boolean;
    variant?: InputVariant;
    round?: InputRound;
    size?: InputSize;
    open?: boolean;
    buttonTitle?: string;
    placeholder?: string;
  }>(),
  { modelValue: "", mono: false, variant: "default", round: "md", size: "md", open: false },
);

const emit = defineEmits<{ "update:modelValue": [value: string]; toggleOpen: [] }>();

const focused = ref(false);
const hasError = computed(() => Boolean(props.error));
const active = computed(() => props.open || focused.value);

const shellClass = computed(() =>
  inputSelectShellClassName({
    size: props.size,
    round: props.round,
    variant: props.variant,
    error: hasError.value,
    active: active.value,
    open: props.open,
  }),
);
const inputClass = computed(() =>
  inputSelectInputClassName({ size: props.size, mono: props.mono }),
);
const chevronSize = computed(() => SELECT_TRIGGER_SIZE[props.size].chevron);
</script>

<template>
  <div :class="INPUT_SELECT_ROOT_CLASS">
    <span v-if="props.label" :class="INPUT_LABEL_CLASS">{{ props.label }}</span>
    <span :class="shellClass">
      <input
        :value="props.modelValue"
        :class="inputClass"
        :placeholder="props.placeholder"
        :aria-invalid="hasError || undefined"
        @focus="focused = true"
        @blur="focused = false"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        :class="inputSelectChevronClassName({ size: props.size, round: props.round, open: props.open })"
        :title="props.buttonTitle"
        :aria-expanded="props.open"
        @click="emit('toggleOpen')"
      >
        <LucideIcon
          name="chevron-down"
          :size="chevronSize"
          :class="selectChevronIconClassName(props.open)"
        />
      </button>
    </span>
    <slot />
    <span v-if="props.error" :class="INPUT_ERROR_TEXT_CLASS">{{ props.error }}</span>
    <span v-else-if="props.hint" :class="INPUT_HINT_CLASS">{{ props.hint }}</span>
  </div>
</template>
