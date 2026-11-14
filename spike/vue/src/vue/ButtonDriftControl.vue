<script setup lang="ts">
/**
 * Negative control for the comparator: the Vue Button with exactly ONE utility
 * removed (`font-medium!` → font-weight 500 → 400). If the harness cannot see
 * this, its "zero drift" verdicts are worthless.
 */
import { buttonClassName } from "@shared/classes";

const props = withDefaults(defineProps<{ variant?: "primary" }>(), { variant: "primary" });

const base = buttonClassName({ variant: props.variant, size: "md", round: "sm", className: "active:scale-95" });
const drifted = base
  .split(" ")
  .filter((token) => token !== "font-medium!")
  .join(" ");
</script>

<template>
  <button type="button" :class="drifted">主要</button>
</template>
