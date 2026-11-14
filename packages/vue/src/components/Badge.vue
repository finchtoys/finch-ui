<script setup lang="ts">
import { badgeClassName, freeModelBadgeClassName } from "@shared/classes";
import type { BadgeSize, BadgeVariant } from "@shared/classes";

const props = withDefaults(
  defineProps<{ variant?: BadgeVariant; size?: BadgeSize; freeModel?: boolean }>(),
  { variant: "neutral", size: "sm", freeModel: false },
);

// FreeModelBadge in React is a Badge whose `className` carries the override;
// keep that shape so both produce the same token set.
const classes = props.freeModel ? badgeClassName({ className: freeModelBadgeClassName() }) : badgeClassName({ variant: props.variant, size: props.size });
</script>

<template>
  <span :class="classes">
    <slot name="leading" />
    <slot />
  </span>
</template>
