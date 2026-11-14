<script setup lang="ts">
import {
  ICON_TAB_BADGE_CLASS,
  ICON_TAB_ICON_WRAP_CLASS,
  iconTabBarClassName,
  iconTabClassName,
  iconTabIconInnerClassName,
  iconTabLabelClassName,
} from "@shared/classes";
import Tooltip from "./Tooltip.vue";

export interface IconTabItem {
  key: string;
  label: string;
  /** Icon node (pass `h(LucideIcon, …)` or your own component). */
  icon?: unknown;
  align?: "start" | "end";
  iconOnly?: boolean;
  iconClassName?: string;
  tooltip?: string;
  badge?: number;
}

const props = defineProps<{ tabs: IconTabItem[]; activeKey: string }>();
const emit = defineEmits<{ change: [key: string]; reselect: [key: string] }>();

function onSelect(tab: IconTabItem) {
  if (props.activeKey === tab.key) emit("reselect", tab.key);
  else emit("change", tab.key);
}

// The first `align: "end"` tab is pushed right and stays grouped with later ones.
function pushEndFor(index: number): boolean {
  const first = props.tabs.findIndex((tab) => tab.align === "end");
  return first !== -1 && index === first;
}
</script>

<template>
  <div :class="iconTabBarClassName()">
    <Tooltip v-for="(tab, index) in props.tabs" :key="tab.key" :content="tab.tooltip ?? tab.label" placement="bottom" :delay="400">
      <button
        type="button"
        :aria-pressed="props.activeKey === tab.key"
        :class="iconTabClassName({ active: props.activeKey === tab.key, pushEnd: pushEndFor(index) })"
        @click="onSelect(tab)"
      >
        <span :class="ICON_TAB_ICON_WRAP_CLASS">
          <span :class="iconTabIconInnerClassName(tab.iconClassName)">
            <component :is="tab.icon" />
          </span>
          <span v-if="tab.badge && tab.badge > 0" :class="ICON_TAB_BADGE_CLASS" aria-hidden="true">
            {{ tab.badge > 99 ? "99+" : tab.badge }}
          </span>
        </span>
        <span v-if="!tab.iconOnly" :class="iconTabLabelClassName(props.activeKey === tab.key)">{{ tab.label }}</span>
      </button>
    </Tooltip>
  </div>
</template>
