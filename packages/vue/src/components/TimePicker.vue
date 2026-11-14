<script setup lang="ts">
/** Vue port of TimePicker.tsx (hour + minute columns in a MenuPanel). */
import { computed, nextTick, ref, watch } from "vue";
import {
  TIME_PICKER_CLOCK_CLASS,
  TIME_PICKER_COLUMN_CLASS,
  TIME_PICKER_COLUMN_LABEL_CLASS,
  TIME_PICKER_COLUMN_SCROLL_CLASS,
  TIME_PICKER_PANEL_CLASS,
  TIME_PICKER_PLAIN_TRIGGER_CLASS,
  menuPanelClassName,
  timePickerChevronClassName,
  timePickerItemClassName,
  timePickerRootClassName,
  timePickerTriggerClassName,
} from "@shared/classes";
import Button from "./Button.vue";
import LucideIcon from "../icons/LucideIcon.vue";

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const ITEM_H = 28;

const props = withDefaults(
  defineProps<{ hour: number; minute: number; plain?: boolean; disabled?: boolean; className?: string }>(),
  { plain: false, disabled: false },
);

const emit = defineEmits<{ change: [hour: number, minute: number] }>();

const open = ref(false);
const rootEl = ref<HTMLElement | null>(null);
const hourScroll = ref<HTMLElement | null>(null);
const minuteScroll = ref<HTMLElement | null>(null);

const hh = computed(() => String(props.hour).padStart(2, "0"));
const mm = computed(() => String(props.minute).padStart(2, "0"));

watch(open, async (value) => {
  if (!value) return;
  await nextTick();
  requestAnimationFrame(() => {
    if (hourScroll.value) hourScroll.value.scrollTop = Math.max(0, props.hour * ITEM_H - ITEM_H * 2);
    const index = MINUTES.indexOf(props.minute);
    if (minuteScroll.value) minuteScroll.value.scrollTop = Math.max(0, (index >= 0 ? index : 0) * ITEM_H - ITEM_H * 2);
  });
});

function toggleOpen() {
  if (!props.disabled) open.value = !open.value;
}

function setHour(hour: number) {
  emit("change", hour, props.minute);
}

function setMinute(minute: number) {
  emit("change", props.hour, minute);
  open.value = false;
}

function onOutside(event: PointerEvent) {
  if (!rootEl.value?.contains(event.target as Node)) open.value = false;
}
</script>

<template>
  <div ref="rootEl" :class="timePickerRootClassName(props.className)" @pointerdown.capture="onOutside">
    <Button
      v-if="props.plain"
      variant="ghost"
      size="sm"
      :pressed="open"
      :disabled="props.disabled"
      :class="TIME_PICKER_PLAIN_TRIGGER_CLASS"
      :aria-expanded="open"
      @click="toggleOpen"
    >
      {{ hh }}:{{ mm }}
      <template #trailing>
        <LucideIcon name="chevron-down" :size="14" :stroke-width="2" :class="timePickerChevronClassName(open)" />
      </template>
    </Button>
    <Button
      v-else
      variant="secondary"
      size="sm"
      :disabled="props.disabled"
      :class="timePickerTriggerClassName(open)"
      :aria-expanded="open"
      @click="toggleOpen"
    >
      <template #leading>
        <LucideIcon name="clock" :size="14" :stroke-width="1.9" :class="TIME_PICKER_CLOCK_CLASS" />
      </template>
      {{ hh }}:{{ mm }}
    </Button>

    <div v-if="open" :class="[menuPanelClassName(false), TIME_PICKER_PANEL_CLASS]">
      <div :class="TIME_PICKER_COLUMN_CLASS">
        <span :class="TIME_PICKER_COLUMN_LABEL_CLASS">HH</span>
        <div ref="hourScroll" :class="TIME_PICKER_COLUMN_SCROLL_CLASS" style="overflow-y: auto">
          <button
            v-for="h in HOURS"
            :key="h"
            type="button"
            :class="timePickerItemClassName(h === props.hour)"
            @click="setHour(h)"
          >
            {{ String(h).padStart(2, "0") }}
          </button>
        </div>
      </div>
      <div :class="TIME_PICKER_COLUMN_CLASS">
        <span :class="TIME_PICKER_COLUMN_LABEL_CLASS">MM</span>
        <div ref="minuteScroll" :class="TIME_PICKER_COLUMN_SCROLL_CLASS" style="overflow-y: auto">
          <button
            v-for="m in MINUTES"
            :key="m"
            type="button"
            :class="timePickerItemClassName(m === props.minute)"
            @click="setMinute(m)"
          >
            {{ String(m).padStart(2, "0") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
