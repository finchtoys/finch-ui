<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { SegmentedControl } from "@finch-ui-vue";
import DisplaySection from "./sections/DisplaySection.vue";
import FormSection from "./sections/FormSection.vue";
import SelectSection from "./sections/SelectSection.vue";
import OverlaySection from "./sections/OverlaySection.vue";
import { applyTheme, type DemoTheme } from "./theme";

const props = withDefaults(defineProps<{ initialTheme?: DemoTheme; embedded?: boolean }>(), {
  initialTheme: "light",
  embedded: false,
});

const theme = ref<DemoTheme>(props.initialTheme);
const themeOptions = [
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
  { value: "custom", label: "自定义皮肤" },
];

const themeHint = computed(() =>
  theme.value === "custom" ? "自定义皮肤：只覆盖 --finch-* 变量" : theme.value === "dark" ? "内置深色 token" : "内置浅色 token",
);

onMounted(() => applyTheme(theme.value));

function setTheme(value: string) {
  theme.value = value as DemoTheme;
  applyTheme(theme.value);
}
</script>

<template>
  <div class="demo" :style="props.embedded ? { paddingTop: 0 } : undefined">
    <div class="demo__bar">
      <p class="demo__title">@finchtoys/ui-vue · 40 个组件</p>
      <SegmentedControl :options="themeOptions" :value="theme" @change="setTheme" />
      <span class="demo__hint">{{ themeHint }}</span>
    </div>

    <DisplaySection />
    <FormSection />
    <SelectSection />
    <OverlaySection />
  </div>
</template>

<style>
/* Modal width lives with the demo, not the package: the library ships no layout CSS. */
.demo-modal {
  width: min(420px, calc(100vw - 40px));
}
</style>
