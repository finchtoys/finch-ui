<script setup lang="ts">
import { computed } from "vue";
import { workingTextClassName, workingTextStyle } from "@shared/classes";

const props = withDefaults(
  defineProps<{ active?: boolean; tone?: "primary" | "secondary" | "tertiary" | "accent" }>(),
  { active: false, tone: "secondary" },
);

const style = computed(() => workingTextStyle({ tone: props.tone }));
</script>

<template>
  <span :class="workingTextClassName({ active: props.active })" :style="style"><slot /></span>
</template>
