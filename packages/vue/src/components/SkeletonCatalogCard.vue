<script setup lang="ts">
import { computed } from "vue";
import {
  SKELETON_CARD_ACTION_CLASS,
  SKELETON_CARD_ACTION_WRAP_CLASS,
  SKELETON_CARD_LINE_CLASS,
  SKELETON_CARD_LINE_FULL_CLASS,
  SKELETON_CARD_TITLE_BAR_CLASS,
  SKELETON_CARD_CLASS,
  SKELETON_CARD_DESC_CLASS,
  SKELETON_CARD_HEADER_CLASS,
  SKELETON_CARD_TITLE_WRAP_CLASS,
} from "@shared/classes";
import SkeletonBlock from "./SkeletonBlock.vue";

const props = withDefaults(defineProps<{ index?: number }>(), { index: 0 });

const CARD_TITLE_WIDTHS = [140, 176, 108, 160, 124, 152];
const CARD_DESC_WIDTHS: [string, string][] = [
  ["88%", "72%"],
  ["84%", "68%"],
  ["92%", "76%"],
  ["80%", "64%"],
  ["90%", "70%"],
  ["86%", "74%"],
];

const titleWidth = computed(() => CARD_TITLE_WIDTHS[props.index % CARD_TITLE_WIDTHS.length]);
const [d2, d3] = CARD_DESC_WIDTHS[props.index % CARD_DESC_WIDTHS.length];
</script>

<template>
  <div :class="SKELETON_CARD_CLASS">
    <div :class="SKELETON_CARD_HEADER_CLASS">
      <div :class="SKELETON_CARD_TITLE_WRAP_CLASS">
        <SkeletonBlock :class="SKELETON_CARD_TITLE_BAR_CLASS" :style="{ width: `${titleWidth}px` }" />
      </div>
      <div :class="SKELETON_CARD_ACTION_WRAP_CLASS">
        <SkeletonBlock :class="SKELETON_CARD_ACTION_CLASS" />
      </div>
    </div>
    <div :class="SKELETON_CARD_DESC_CLASS">
      <SkeletonBlock :class="SKELETON_CARD_LINE_FULL_CLASS" />
      <SkeletonBlock :class="SKELETON_CARD_LINE_CLASS" :style="{ width: d2 }" />
      <SkeletonBlock :class="SKELETON_CARD_LINE_CLASS" :style="{ width: d3 }" />
    </div>
  </div>
</template>
