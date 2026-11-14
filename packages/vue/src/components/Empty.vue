<script setup lang="ts">
import {
  EMPTY_DESCRIPTION_CLASS,
  EMPTY_ICON_BOX_CLASS,
  EMPTY_PLAIN_ICON_CLASS,
  EMPTY_TITLE_CLASS,
  emptyClassName,
} from "@shared/classes";

const props = withDefaults(defineProps<{ plainIcon?: boolean; compact?: boolean; title?: string }>(), {
  plainIcon: false,
  compact: false,
});
</script>

<template>
  <div :class="emptyClassName({ compact: props.compact })">
    <div v-if="$slots.icon" :class="props.plainIcon ? EMPTY_PLAIN_ICON_CLASS : EMPTY_ICON_BOX_CLASS">
      <slot name="icon" />
    </div>
    <p v-if="props.title" :class="EMPTY_TITLE_CLASS">{{ props.title }}</p>
    <p v-if="$slots.description" :class="EMPTY_DESCRIPTION_CLASS"><slot name="description" /></p>
    <slot />
  </div>
</template>
