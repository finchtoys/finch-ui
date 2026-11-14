<script setup lang="ts">
import { computed } from "vue";
import { textAreaClassName } from "@shared/classes";
import type { InputRound, InputVariant } from "@shared/classes";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    unstyled?: boolean;
    variant?: InputVariant;
    round?: InputRound;
    error?: boolean;
  }>(),
  { modelValue: "", unstyled: false, variant: "default", round: "md", error: false },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const classes = computed(() =>
  textAreaClassName({ unstyled: props.unstyled, variant: props.variant, round: props.round, error: props.error }),
);
</script>

<template>
  <textarea
    :value="props.modelValue"
    :class="classes"
    :aria-invalid="props.error || undefined"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
