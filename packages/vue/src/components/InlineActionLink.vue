<script setup lang="ts">
import { INLINE_ACTION_LINK_ICON_CLASS, INLINE_ACTION_LINK_LABEL_CLASS, inlineActionLinkClassName } from "@shared/classes";

const props = withDefaults(defineProps<{ type?: "button" | "submit" | "reset"; disabled?: boolean }>(), {
  type: "button",
  disabled: false,
});
</script>

<template>
  <button :type="props.type" :disabled="props.disabled" :class="inlineActionLinkClassName()">
    <span v-if="$slots.leading" :class="INLINE_ACTION_LINK_ICON_CLASS"><slot name="leading" /></span>
    <span :class="INLINE_ACTION_LINK_LABEL_CLASS"><slot /></span>
    <span v-if="$slots.trailing" :class="INLINE_ACTION_LINK_ICON_CLASS"><slot name="trailing" /></span>
  </button>
</template>
