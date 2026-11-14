<script setup lang="ts">
import {
  BREADCRUMB_BUTTON_CLASS,
  BREADCRUMB_BUTTON_LABEL_CLASS,
  BREADCRUMB_ICON_CLASS,
  BREADCRUMB_ITEM_CLASS,
  BREADCRUMB_LEAF_LABEL_CLASS,
  BREADCRUMB_SEPARATOR_CLASS,
  breadcrumbLeafClassName,
  breadcrumbNavClassName,
} from "@shared/classes";
import Button from "./Button.vue";
import LucideIcon from "../icons/LucideIcon.vue";
import Tooltip from "./Tooltip.vue";

export interface BreadcrumbItem {
  label: string;
  active?: boolean;
  /** Optional leading icon node (pass through `h()` / a component). */
  icon?: unknown;
  onClick?: () => void;
}

const props = defineProps<{ items: BreadcrumbItem[]; ariaLabel: string }>();
</script>

<template>
  <nav v-if="props.items.length" :class="breadcrumbNavClassName()" :aria-label="props.ariaLabel">
    <div v-for="(item, index) in props.items" :key="index" :class="BREADCRUMB_ITEM_CLASS">
      <Tooltip :content="item.label">
        <Button
          v-if="item.onClick && index < props.items.length - 1"
          variant="ghost"
          size="sm"
          :class="BREADCRUMB_BUTTON_CLASS"
          @click="item.onClick?.()"
        >
          <template v-if="item.icon" #leading>
            <span :class="BREADCRUMB_ICON_CLASS" aria-hidden="true">
              <component :is="item.icon" />
            </span>
          </template>
          <span :class="BREADCRUMB_BUTTON_LABEL_CLASS">{{ item.label }}</span>
        </Button>
        <span
          v-else
          :aria-current="index === props.items.length - 1 ? 'page' : undefined"
          :class="breadcrumbLeafClassName(item.active)"
        >
          <span v-if="item.icon" :class="BREADCRUMB_ICON_CLASS" aria-hidden="true">
            <component :is="item.icon" />
          </span>
          <span :class="BREADCRUMB_LEAF_LABEL_CLASS">{{ item.label }}</span>
        </span>
      </Tooltip>
      <LucideIcon
        v-if="index < props.items.length - 1"
        name="chevron-right"
        :size="14"
        :stroke-width="1.8"
        :class="BREADCRUMB_SEPARATOR_CLASS"
        aria-hidden="true"
      />
    </div>
  </nav>
</template>
