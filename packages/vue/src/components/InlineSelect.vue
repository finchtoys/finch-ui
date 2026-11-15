<script setup lang="ts">
import { computed, ref } from "vue";
import {
  INLINE_SELECT_LABEL_CLASS,
  inlineSelectButtonClassName,
  inlineSelectChevronClassName,
  inlineSelectMenuClassName,
} from "@shared/classes";
import Button from "./Button.vue";
import MenuItem from "./MenuItem.vue";
import MenuPopover from "./MenuPopover.vue";
import LucideIcon from "../icons/LucideIcon.vue";
import { resolveAnchor, type AnchorLike } from "../anchor";

export interface InlineSelectOption {
  value: string | number;
  label: string;
  /** Icon node for the menu row. */
  icon?: unknown;
  separatorBefore?: boolean;
}

const props = withDefaults(
  defineProps<{
    value: string | number;
    options: InlineSelectOption[];
    buttonClassName?: string;
    menuClassName?: string;
    align?: "left" | "right";
  }>(),
  { align: "left" },
);

const emit = defineEmits<{ change: [value: string | number] }>();

const open = ref(false);
const triggerEl = ref<AnchorLike>(null);
const anchorEl = () => resolveAnchor(triggerEl.value);

const selected = computed(() => props.options.find((option) => option.value === props.value) ?? props.options[0]);
const displayLabel = computed(() => (selected.value ? selected.value.label : String(props.value)));

function choose(option: InlineSelectOption) {
  emit("change", option.value);
  open.value = false;
}
</script>

<template>
  <div>
    <Button
      ref="triggerEl"
      variant="ghost"
      size="sm"
      :pressed="open"
      :class="inlineSelectButtonClassName(props.buttonClassName)"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span :class="INLINE_SELECT_LABEL_CLASS">{{ displayLabel }}</span>
      <template #trailing>
        <LucideIcon name="chevron-down" :size="14" :stroke-width="2" :class="inlineSelectChevronClassName(open)" />
      </template>
    </Button>
    <MenuPopover
      :open="open"
      :get-anchor="anchorEl"
      :placement="props.align === 'right' ? 'bottom-end' : 'bottom-start'"
      :gap="6"
      :class-name="inlineSelectMenuClassName(props.menuClassName)"
      @close="open = false"
    >
      <template v-for="option in props.options" :key="option.value">
        <MenuItem v-if="option.separatorBefore" separator />
        <MenuItem :active="option.value === props.value" @click="choose(option)">
          <template v-if="option.icon" #icon><component :is="option.icon" /></template>
          {{ option.label }}
        </MenuItem>
      </template>
    </MenuPopover>
  </div>
</template>
