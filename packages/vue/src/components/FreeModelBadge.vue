<script setup lang="ts">
import Badge from "./Badge.vue";

const props = defineProps<{ isFree?: boolean }>();
</script>

<template>
  <Badge v-if="props.isFree === true" free-model>Free</Badge>
</template>
