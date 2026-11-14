<script setup lang="ts">
import { computed } from "vue";
import {
  ALERT_BODY_CLASS,
  ALERT_CONTENT_CLASS,
  ALERT_CUSTOM_ICON_CLASS,
  ALERT_ICON_CLASS,
  ALERT_TITLE_CLASS,
  alertClassName,
  alertVariantStyle,
} from "@shared/classes";
import type { AlertVariant } from "@shared/classes";
import LucideIcon from "../icons/LucideIcon.vue";

const props = withDefaults(defineProps<{ variant?: AlertVariant; title?: string }>(), { variant: "info" });

const ICON_FOR: Record<AlertVariant, string> = {
  info: "info",
  warning: "alert-triangle",
  error: "alert-circle",
  success: "check-circle-2",
};

const style = computed(() => alertVariantStyle(props.variant));
const iconName = computed(() => ICON_FOR[props.variant]);
const role = computed(() => (props.variant === "error" ? "alert" : "status"));
</script>

<template>
  <div :role="role" :style="style" :class="alertClassName()">
    <span v-if="$slots.icon" :class="ALERT_CUSTOM_ICON_CLASS"><slot name="icon" /></span>
    <LucideIcon
      v-else
      :name="iconName"
      :size="15"
      :stroke-width="1.8"
      :class="ALERT_ICON_CLASS"
      :style="props.variant === 'info' ? { color: 'var(--ui-info-strong)' } : undefined"
    />
    <div :class="ALERT_BODY_CLASS">
      <div v-if="props.title" :class="ALERT_TITLE_CLASS" :style="props.variant === 'info' ? { color: 'var(--ui-info-strong)' } : undefined">
        {{ props.title }}
      </div>
      <div :class="ALERT_CONTENT_CLASS"><slot /></div>
    </div>
  </div>
</template>
