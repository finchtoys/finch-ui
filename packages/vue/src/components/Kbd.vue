<script setup lang="ts">
import { computed, useSlots } from "vue";
import type { VNode } from "vue";
import { KBD_SYMBOL_CLASS, kbdClassName } from "@shared/classes";

const props = defineProps<{ className?: string }>();
const slots = useSlots();

const KEY_SYMBOL = /^[⌘⌥⇧⌃↵↑↓←→]$/;

/** Mirrors Kbd.tsx: only plain text is split, custom nodes pass through. */
const parts = computed<{ text: string; symbol: boolean }[] | null>(() => {
  const nodes = (slots.default?.() ?? []) as VNode[];
  const texts = nodes.map((node) => (typeof node.children === "string" ? node.children : null));
  if (texts.some((text) => text === null)) return null;
  const joined = texts.join("");
  const split = joined.split(/([⌘⌥⇧⌃↵↑↓←→])/).filter(Boolean);
  if (!split.some((part) => KEY_SYMBOL.test(part))) return null;
  return split.map((text) => ({ text, symbol: KEY_SYMBOL.test(text) }));
});
</script>

<template>
  <kbd :class="kbdClassName(props.className)">
    <template v-if="parts">
      <!-- v-bind of an empty object keeps the plain part free of a class="" attr -->
      <span v-for="(part, index) in parts" :key="index" v-bind="part.symbol ? { class: KBD_SYMBOL_CLASS } : {}">{{
        part.text
      }}</span>
    </template>
    <slot v-else />
  </kbd>
</template>
