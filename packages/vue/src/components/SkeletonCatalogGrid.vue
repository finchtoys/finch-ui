<script setup lang="ts">
import { SKELETON_CARD_GRID_CLASS } from "@shared/classes";
import SkeletonCatalogCard from "./SkeletonCatalogCard.vue";

const props = withDefaults(defineProps<{ count?: number }>(), { count: 6 });
</script>

<template>
  <div :class="SKELETON_CARD_GRID_CLASS">
    <SkeletonCatalogCard v-for="i in props.count" :key="i - 1" :index="i - 1" />
  </div>
</template>
