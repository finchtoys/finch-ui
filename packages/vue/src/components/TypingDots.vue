<script setup lang="ts">
import { typingDotsClassName } from "@shared/classes";

const props = withDefaults(defineProps<{ size?: "default" | "small" | "tiny" }>(), { size: "default" });
</script>

<template>
  <span :class="typingDotsClassName({ size: props.size })" aria-hidden="true">
    <span /><span /><span />
  </span>
</template>
