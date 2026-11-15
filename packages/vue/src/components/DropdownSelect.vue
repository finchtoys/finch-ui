<script setup lang="ts">
/** Vue port of DropdownSelect.tsx. Uses a native scroll box for the option list
 *  (the React version wraps it in ScrollArea for edge fades — see README). */
import { computed, ref } from "vue";
import {
  DROPDOWN_OPTION_DETAIL_CLASS,
  DROPDOWN_OPTION_LABEL_CLASS,
  DROPDOWN_OPTION_ROW_CLASS,
  INPUT_LABEL_CLASS,
  dropdownMenuPanelClassName,
  dropdownMenuPopoverClassName,
  dropdownRootClassName,
  dropdownTriggerClassName,
  selectChevronClass,
  menuPanelClassName,
  selectChevronIconClassName,
  selectValueClass,
  selectValueText,
  SELECT_TRIGGER_SIZE,
} from "@shared/classes";
import type { InputRound, InputSize } from "@shared/classes";
import MenuItem from "./MenuItem.vue";
import LucideIcon from "../icons/LucideIcon.vue";
import { resolveAnchor, type AnchorLike } from "../anchor";
import MenuPopover from "./MenuPopover.vue";

export interface DropdownSelectOption {
  value: string | number;
  label: string;
  detail?: string;
  separatorBefore?: boolean;
  icon?: unknown;
}

const props = withDefaults(
  defineProps<{
    label?: string;
    value: string | number;
    options: DropdownSelectOption[];
    className?: string;
    title?: string;
    maxMenuHeight?: number;
    size?: InputSize;
    round?: InputRound;
    block?: boolean;
    portal?: boolean;
  }>(),
  { maxMenuHeight: 320, size: "md", round: "md", block: false, portal: false },
);

const emit = defineEmits<{ change: [value: string | number] }>();

const open = ref(false);
const menuPlacement = ref<"top" | "bottom">("bottom");
const menuMaxHeight = ref(props.maxMenuHeight);
const triggerWidth = ref<number | undefined>(undefined);
const triggerEl = ref<AnchorLike>(null);
const anchorEl = () => resolveAnchor(triggerEl.value);

const selected = computed(() => props.options.find((option) => option.value === props.value) ?? props.options[0]);
const chevronSize = computed(() => SELECT_TRIGGER_SIZE[props.size].chevron);

function measureMenuSpace() {
  const button = anchorEl();
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const menuGap = 8;
  const menuGutter = 12;
  const dialogueContent = props.portal ? button.closest<HTMLElement>(".appScrollbar") : null;
  const lowerBoundary = Math.min(
    window.innerHeight,
    dialogueContent?.getBoundingClientRect().bottom ?? window.innerHeight,
  );
  const bottomSpace = lowerBoundary - rect.bottom - menuGap - menuGutter;
  const topSpace = rect.top - menuGap - menuGutter;
  menuPlacement.value = bottomSpace < 180 && topSpace > bottomSpace ? "top" : "bottom";
  menuMaxHeight.value = Math.max(
    120,
    Math.min(props.maxMenuHeight, menuPlacement.value === "top" ? topSpace : bottomSpace),
  );
  triggerWidth.value = rect.width;
}

function toggleOpen() {
  measureMenuSpace();
  open.value = !open.value;
}

function choose(option: DropdownSelectOption) {
  emit("change", option.value);
  open.value = false;
}

function onOutside(event: PointerEvent) {
  if (!props.portal && !anchorEl()?.parentElement?.contains(event.target as Node)) open.value = false;
}
function onEscape(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}
</script>

<template>
  <div :class="dropdownRootClassName(props.className)" @pointerdown.capture="onOutside" @keydown="onEscape">
    <span v-if="props.label" :class="INPUT_LABEL_CLASS">{{ props.label }}</span>
    <button
      ref="triggerEl"
      type="button"
      :class="dropdownTriggerClassName({ round: props.round, size: props.size, block: props.block, open })"
      :aria-expanded="open"
      :title="props.title"
      @click="toggleOpen"
    >
      <span :class="selectValueClass(props.size)">{{ selectValueText(selected?.label) }}</span>
      <span :class="selectChevronClass(props.size, props.round, open)">
        <LucideIcon name="chevron-down" :size="chevronSize" :class="selectChevronIconClassName(open)" />
      </span>
    </button>

    <MenuPopover
      v-if="props.portal"
      :open="open"
      :get-anchor="anchorEl"
      :placement="menuPlacement === 'top' ? 'top-start' : 'bottom-start'"
      :class-name="dropdownMenuPopoverClassName(props.block)"
      :panel-style="props.block && triggerWidth ? { width: `${triggerWidth}px` } : undefined"
      @close="open = false"
    >
      <div :style="{ maxHeight: `${menuMaxHeight}px`, overflowY: 'auto' }" class="appScrollbar">
        <template v-for="option in props.options" :key="option.value">
          <MenuItem v-if="option.separatorBefore" separator />
          <MenuItem
            :active="option.value === props.value"
            :class="DROPDOWN_OPTION_ROW_CLASS"
            @click="choose(option)"
          >
            <template v-if="option.icon" #icon><component :is="option.icon" /></template>
            <span :class="DROPDOWN_OPTION_LABEL_CLASS">{{ option.label }}</span>
            <template v-if="option.detail" #trailing>
              <span :class="DROPDOWN_OPTION_DETAIL_CLASS">{{ option.detail }}</span>
            </template>
          </MenuItem>
        </template>
      </div>
    </MenuPopover>

    <div
      v-else-if="open"
      :class="[menuPanelClassName(false), dropdownMenuPanelClassName({ block: props.block, placement: menuPlacement })]"
    >
      <div :style="{ maxHeight: `${menuMaxHeight}px`, overflowY: 'auto' }" class="appScrollbar">
        <template v-for="option in props.options" :key="option.value">
          <MenuItem
            :active="option.value === props.value"
            :class="DROPDOWN_OPTION_ROW_CLASS"
            @click="choose(option)"
          >
            <span :class="DROPDOWN_OPTION_LABEL_CLASS">{{ option.label }}</span>
          </MenuItem>
        </template>
      </div>
    </div>
  </div>
</template>
