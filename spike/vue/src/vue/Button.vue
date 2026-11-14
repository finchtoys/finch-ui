<script setup lang="ts">
/**
 * Vue 3 port of library/components/Button.tsx (Composition API, SFC).
 *
 * Class strings come from src/shared/classes.ts — the same module the React
 * version would import if the extraction proposal is adopted.
 */
import { computed, ref, useAttrs } from "vue";
import { buttonClassName, buttonSpanClassName } from "@shared/classes";
import type { ButtonRound, ButtonSize, ButtonVariant } from "@shared/classes";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    round?: ButtonRound;
    pressed?: boolean;
    disabled?: boolean;
    as?: "button" | "span";
    /** Defaults mirror Button.tsx; `class`/`className` from the caller wins. */
    className?: string;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "ghost",
    size: "md",
    round: "sm",
    as: "button",
    type: "button",
    className: "",
    // Vue casts an ABSENT boolean prop to `false`, while React keeps it
    // `undefined`. That difference shows up in the DOM (`aria-pressed="false"`
    // vs no attribute at all). An explicit `default: undefined` restores
    // React's tri-state — found by the harness, see findings §2.2.
    pressed: undefined,
    disabled: undefined,
  },
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();

/** Vue keeps ARIA attrs as strings; React accepts booleans. Normalise, and keep
 *  "absent" distinct from "false" (see the `pressed: undefined` default). */
const ariaPressed = computed<boolean | undefined>(() => {
  if (props.pressed !== undefined) return props.pressed;
  const raw = attrs["aria-pressed"];
  if (raw === undefined || raw === null) return undefined;
  return raw === "true" || raw === true;
});
const attrs = useAttrs();
const el = ref<HTMLElement | null>(null);

/** `icon` slot presence is Button.tsx's `icon != null`. */
const slots = defineSlots<{ default?: () => unknown; icon?: () => unknown; leading?: () => unknown; trailing?: () => unknown }>();
const isIconMode = computed(() => Boolean(slots.icon));

const callerClass = computed(() => {
  const fromAttr = typeof attrs.class === "string" ? attrs.class : undefined;
  if (fromAttr !== undefined) return fromAttr;
  if (props.className) return props.className;
  return "active:scale-95";
});

const composedClassName = computed(() => {
  const base = buttonClassName({
    variant: props.variant,
    size: props.size,
    round: props.round,
    iconMode: isIconMode.value,
    pressed: props.pressed,
    className: callerClass.value,
  });
  return props.as === "span" ? buttonSpanClassName(base, props.disabled) : base;
});

/** Everything except class goes onto the root element, like React's {...props}. */
const passThrough = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

function onClick(event: MouseEvent) {
  if (props.disabled) return;
  emit("click", event);
}

function onKeyDown(event: KeyboardEvent) {
  if (props.as !== "span") return;
  const forwarded = (attrs.onKeydown ?? null) as ((e: KeyboardEvent) => void) | null;
  forwarded?.(event);
  if (props.disabled) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    emit("click", event as unknown as MouseEvent);
  }
}

defineExpose({ el });
</script>

<template>
  <button
    v-if="props.as === 'button'"
    ref="el"
    :type="props.type"
    :disabled="props.disabled"
    :aria-pressed="ariaPressed"
    :class="composedClassName"
    v-bind="passThrough"
    @click="onClick"
  >
    <slot v-if="isIconMode" name="icon" />
    <template v-else>
      <slot name="leading" />
      <slot />
      <slot name="trailing" />
    </template>
  </button>
  <span
    v-else
    ref="el"
    role="button"
    :tabindex="props.disabled ? -1 : 0"
    :aria-pressed="ariaPressed"
    :aria-disabled="props.disabled || undefined"
    :class="composedClassName"
    v-bind="passThrough"
    @click="onClick"
    @keydown="onKeyDown"
  >
    <slot v-if="isIconMode" name="icon" />
    <template v-else>
      <slot name="leading" />
      <slot />
      <slot name="trailing" />
    </template>
  </span>
</template>
