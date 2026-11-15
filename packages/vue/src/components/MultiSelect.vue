<script setup lang="ts">
/** Vue port of MultiSelect.tsx — always portals its popup. */
import { computed, ref } from "vue";
import {
  DROPDOWN_OPTION_DETAIL_CLASS,
  DROPDOWN_OPTION_LABEL_CLASS,
  DROPDOWN_OPTION_ROW_CLASS,
  INPUT_LABEL_CLASS,
  MULTISELECT_TRAILING_CLASS,
  SELECT_TRIGGER_SIZE,
  multiSelectCheckClassName,
  multiSelectRootClassName,
  multiSelectTriggerClassName,
  selectChevronClass,
  selectChevronIconClassName,
  selectValueClass,
  selectValueText,
} from "@shared/classes";
import type { InputRound, InputSize } from "@shared/classes";
import MenuItem from "./MenuItem.vue";
import MenuPopover from "./MenuPopover.vue";
import LucideIcon from "../icons/LucideIcon.vue";
import { resolveAnchor, type AnchorLike } from "../anchor";

export interface MultiSelectOption {
  value: string;
  label: string;
  detail?: string;
}

const props = withDefaults(
  defineProps<{
    label?: string;
    modelValue: string[];
    options: MultiSelectOption[];
    placeholder?: string;
    summaryThreshold?: number;
    className?: string;
    disabled?: boolean;
    title?: string;
    size?: InputSize;
    round?: InputRound;
    maxMenuHeight?: number;
  }>(),
  { modelValue: () => [], summaryThreshold: 3, disabled: false, size: "md", round: "md", maxMenuHeight: 320 },
);

const emit = defineEmits<{ "update:modelValue": [value: string[]] }>();

const open = ref(false);
const menuPlacement = ref<"top" | "bottom">("bottom");
const menuMaxHeight = ref(props.maxMenuHeight);
const triggerWidth = ref<number | undefined>(undefined);
const triggerEl = ref<AnchorLike>(null);
const anchorEl = () => resolveAnchor(triggerEl.value);
const chevronSize = computed(() => SELECT_TRIGGER_SIZE[props.size].chevron);

const selected = computed(() => new Set(props.modelValue));
const selectedLabels = computed(() =>
  props.options.filter((option) => selected.value.has(option.value)).map((option) => option.label),
);
const triggerText = computed(() => {
  if (selectedLabels.value.length === 0) return props.placeholder ?? "";
  if (selectedLabels.value.length > props.summaryThreshold) return String(selectedLabels.value.length);
  return selectedLabels.value.join("、");
});

function measureMenuSpace() {
  const button = anchorEl();
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const menuGap = 8;
  const menuGutter = 12;
  const bottomSpace = window.innerHeight - rect.bottom - menuGap - menuGutter;
  const topSpace = rect.top - menuGap - menuGutter;
  menuPlacement.value = bottomSpace < 180 && topSpace > bottomSpace ? "top" : "bottom";
  menuMaxHeight.value = Math.max(
    120,
    Math.min(props.maxMenuHeight, menuPlacement.value === "top" ? topSpace : bottomSpace),
  );
  triggerWidth.value = rect.width;
}

function toggle() {
  measureMenuSpace();
  open.value = !open.value;
}

/** Keeps the popup open and preserves declared option order (not click order). */
function toggleOption(optionValue: string) {
  const next = selected.value.has(optionValue)
    ? props.modelValue.filter((value) => value !== optionValue)
    : props.options
        .filter((option) => option.value === optionValue || selected.value.has(option.value))
        .map((option) => option.value);
  emit("update:modelValue", [...next]);
}
</script>

<template>
  <div :class="multiSelectRootClassName(props.className)">
    <span v-if="props.label" :class="INPUT_LABEL_CLASS">{{ props.label }}</span>
    <button
      ref="triggerEl"
      type="button"
      :disabled="props.disabled"
      :title="props.title"
      :class="multiSelectTriggerClassName({ round: props.round, size: props.size, empty: selectedLabels.length === 0, open })"
      :aria-expanded="open"
      @click="toggle"
    >
      <span :class="selectValueClass(props.size)">{{ selectValueText(triggerText) }}</span>
      <span :class="selectChevronClass(props.size, props.round, open)">
        <LucideIcon name="chevron-down" :size="chevronSize" :class="selectChevronIconClassName(open)" />
      </span>
    </button>
    <MenuPopover
      :open="open"
      :get-anchor="anchorEl"
      :placement="menuPlacement === 'top' ? 'top-start' : 'bottom-start'"
      class-name="max-w-[min(420px,calc(100vw-24px))] p-2"
      @close="open = false"
    >
      <div :style="triggerWidth ? { width: `${triggerWidth}px` } : undefined">
        <div :style="{ maxHeight: `${menuMaxHeight}px`, overflowY: 'auto' }" class="appScrollbar">
          <MenuItem
            v-for="option in props.options"
            :key="option.value"
            :active="selected.has(option.value)"
            :class="DROPDOWN_OPTION_ROW_CLASS"
            @click="toggleOption(option.value)"
          >
            <span :class="DROPDOWN_OPTION_LABEL_CLASS">{{ option.label }}</span>
            <template #trailing>
              <span :class="MULTISELECT_TRAILING_CLASS">
                <span v-if="option.detail" :class="DROPDOWN_OPTION_DETAIL_CLASS">{{ option.detail }}</span>
                <LucideIcon name="check" :size="14" :stroke-width="2" :class="multiSelectCheckClassName(selected.has(option.value))" />
              </span>
            </template>
          </MenuItem>
        </div>
      </div>
    </MenuPopover>
  </div>
</template>
