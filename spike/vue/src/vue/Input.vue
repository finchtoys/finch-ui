<script setup lang="ts">
/**
 * Vue 3 port of library/components/Input.tsx.
 * Markup structure is copied 1:1 (label > span + span > input + endAdornment >
 * error/hint span) because every one of those wrappers contributes classes that
 * the computed-style comparison checks.
 */
import { computed, ref, useAttrs } from "vue";
import { INPUT_HINT_CLASS, INPUT_ERROR_TEXT_CLASS, INPUT_LABEL_CLASS, inputClassName } from "@shared/classes";
import type { InputRound, InputSize, InputVariant } from "@shared/classes";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    label?: string;
    labelClassName?: string;
    hint?: string;
    error?: string;
    rootClassName?: string;
    mono?: boolean;
    variant?: InputVariant;
    round?: InputRound;
    size?: InputSize;
    className?: string;
  }>(),
  {
    modelValue: "",
    rootClassName: "",
    className: "",
    mono: false,
    variant: "default",
    round: "md",
    size: "md",
  },
);

const emit = defineEmits<{ "update:modelValue": [value: string]; input: [event: Event] }>();
const attrs = useAttrs();
const inputEl = ref<HTMLInputElement | null>(null);

const hasError = computed(() => Boolean(props.error));

const inputClass = computed(() =>
  inputClassName({
    error: hasError.value,
    variant: props.variant,
    round: props.round,
    size: props.size,
    mono: props.mono,
    className: typeof attrs.class === "string" ? attrs.class : props.className,
  }),
);

const rootClass = computed(() => `block ${props.rootClassName}`.trim());

const labelClass = computed(() => `${INPUT_LABEL_CLASS} ${props.labelClassName ?? ""}`.trim());

const passThrough = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
  emit("input", event);
}

defineExpose({ inputEl });
</script>

<template>
  <label :class="rootClass">
    <span v-if="props.label" :class="labelClass">{{ props.label }}</span>
    <span class="flex items-center gap-2">
      <input
        ref="inputEl"
        :value="props.modelValue"
        :class="inputClass"
        v-bind="passThrough"
        :aria-invalid="hasError || (attrs['aria-invalid'] as string | boolean | undefined)"
        @input="onInput"
      />
      <slot name="endAdornment" />
    </span>
    <span v-if="props.error" :class="INPUT_ERROR_TEXT_CLASS">{{ props.error }}</span>
    <span v-else-if="props.hint" :class="INPUT_HINT_CLASS">{{ props.hint }}</span>
  </label>
</template>
