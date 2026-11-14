<script setup lang="ts">
import { computed, ref } from "vue";
import { SECRET_INPUT_REVEAL_CLASS, SECRET_INPUT_ROOT_CLASS, secretInputInputClassName } from "@shared/classes";
import type { InputRound } from "@shared/classes";
import Input from "./Input.vue";
import LucideIcon from "../icons/LucideIcon.vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    showPasswordLabel: string;
    hidePasswordLabel: string;
    round?: InputRound;
    disabled?: boolean;
    placeholder?: string;
  }>(),
  { modelValue: "", round: "md", disabled: false },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const revealed = ref(false);
const revealLabel = computed(() => (revealed.value ? props.hidePasswordLabel : props.showPasswordLabel));
</script>

<template>
  <div :class="SECRET_INPUT_ROOT_CLASS">
    <Input
      :type="revealed ? 'text' : 'password'"
      :round="props.round"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      :model-value="props.modelValue"
      :class="secretInputInputClassName()"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <button
      type="button"
      tabindex="-1"
      :disabled="props.disabled"
      :aria-label="revealLabel"
      :title="revealLabel"
      :class="SECRET_INPUT_REVEAL_CLASS"
      @click="revealed = !revealed"
    >
      <LucideIcon :name="revealed ? 'eye-off' : 'eye'" :size="15" :stroke-width="1.5" />
    </button>
  </div>
</template>
