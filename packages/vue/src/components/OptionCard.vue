<script setup lang="ts">
import { OPTION_CARD_TEXT_CLASS, optionCardClassName } from "@shared/classes";

const props = withDefaults(
  defineProps<{ active?: boolean; selected?: boolean; disabled?: boolean }>(),
  { active: false, selected: false, disabled: false },
);
</script>

<template>
  <div :class="optionCardClassName({ active: props.active, selected: props.selected, disabled: props.disabled })">
    <slot name="marker" />
    <span :class="OPTION_CARD_TEXT_CLASS"><slot /></span>
    <slot name="trailing" />
  </div>
</template>
