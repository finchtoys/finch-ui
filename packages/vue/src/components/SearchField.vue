<script setup lang="ts">
/** Vue port of SearchField.tsx. Uses Kbd + the shared sidebar search classes. */
import { computed, ref } from "vue";
import {
  SEARCH_FIELD_ICON_CLASS,
  searchFieldActionClassName,
  searchFieldClearClassName,
  searchFieldInputClassName,
  searchFieldKbdClassName,
  searchFieldRootClassName,
} from "@shared/classes";
import Kbd from "./Kbd.vue";
import LucideIcon from "../icons/LucideIcon.vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    shortcut?: string;
    clearLabel?: string;
    active?: boolean;
    rootClassName?: string;
    inputClassName?: string;
    actionClassName?: string;
    kbdClassName?: string;
    clearClassName?: string;
    placeholder?: string;
    leadingIcon?: unknown;
  }>(),
  { clearLabel: "Clear search", active: false, rootClassName: "", inputClassName: "", actionClassName: "", kbdClassName: "", clearClassName: "" },
);

const emit = defineEmits<{ "update:modelValue": [value: string]; clear: [] }>();

const focused = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);

const rootClass = computed(() =>
  searchFieldRootClassName({ focused: focused.value, active: props.active, rootClassName: props.rootClassName }),
);
const inputClass = computed(() =>
  searchFieldInputClassName({ focused: focused.value, inputClassName: props.inputClassName }),
);

function clear() {
  emit("update:modelValue", "");
  emit("clear");
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  event.preventDefault();
  if (props.modelValue) clear();
  else inputEl.value?.blur();
}

defineExpose({ inputEl });
</script>

<template>
  <div :class="rootClass" @click="inputEl?.focus()">
    <span :class="SEARCH_FIELD_ICON_CLASS">
      <component :is="props.leadingIcon" v-if="props.leadingIcon" />
      <LucideIcon v-else name="search" :size="16" />
    </span>
    <input
      ref="inputEl"
      type="text"
      :class="inputClass"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="focused = true"
      @blur="focused = false"
      @keydown="onKeyDown"
    />
    <div :class="searchFieldActionClassName(props.actionClassName)">
      <Kbd v-if="props.shortcut" :class="searchFieldKbdClassName(props.kbdClassName)">{{ props.shortcut }}</Kbd>
      <button
        v-if="props.modelValue || focused"
        type="button"
        :class="searchFieldClearClassName(props.clearClassName)"
        :title="props.clearLabel"
        @mousedown.prevent
        @click.stop="clear(); inputEl?.blur()"
      >
        <LucideIcon name="x" :size="16" />
      </button>
    </div>
  </div>
</template>
