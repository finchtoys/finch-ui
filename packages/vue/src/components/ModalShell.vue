<script setup lang="ts">
/**
 * Vue 3 port of library/components/ModalShell.tsx.
 *
 * The interesting parts after the port (all covered by harness checks):
 *  - Teleport to document.body == React's createPortal(…, document.body)
 *  - Esc only closes the topmost shell (z-index scan over
 *    [data-finch-modal-shell], shared with the React version)
 *  - the pre-paint blur of document.activeElement (Electron <webview> focus
 *    stealing) — React does it in useLayoutEffect, Vue in a flush:"post" watch
 *  - backdrop click / backdropOnly / noHeader / headerRight
 */
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { topmostModalIndex } from "@lib/components/modalStack";
import {
  MODAL_HEADER_CLASS,
  MODAL_HEADER_RIGHT_CLASS,
  MODAL_TITLE_CLASS,
  modalBackdropClassName,
  modalShellClassName,
} from "@shared/classes";
import Button from "./Button.vue";
import LucideIcon from "../icons/LucideIcon.vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    zIndex?: number;
    backdropClassName?: string;
    shellClassName?: string;
    role?: string;
    ariaLabel?: string;
    closeLabel: string;
    backdropEffect?: (element: HTMLDivElement) => void | (() => void);
    headerRight?: boolean;
    noHeader?: boolean;
    backdropOnly?: boolean;
    closeOnBackdrop?: boolean;
  }>(),
  {
    zIndex: 200,
    backdropClassName: "bg-black/40",
    shellClassName: "",
    closeOnBackdrop: false,
  },
);

const emit = defineEmits<{ close: [] }>();

const backdropEl = ref<HTMLDivElement | null>(null);
let effectCleanup: void | (() => void);

function isTopmostModal(element: HTMLElement): boolean {
  const modals = [...document.querySelectorAll<HTMLElement>("[data-finch-modal-shell]")];
  const index = topmostModalIndex(modals.map((modal) => Number.parseInt(modal.style.zIndex, 10) || 0));
  return modals[index] === element;
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !backdropEl.value || !isTopmostModal(backdropEl.value)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  (document.activeElement as HTMLElement | null)?.blur();
  emit("close");
}

function attachKeydown() {
  document.addEventListener("keydown", onKeyDown, true);
}
function detachKeydown() {
  document.removeEventListener("keydown", onKeyDown, true);
}

function runBackdropEffect() {
  // Mirror of React's useEffect([backdropEffect, open]).
  if (typeof effectCleanup === "function") effectCleanup();
  effectCleanup = undefined;
  if (!props.open || !backdropEl.value || !props.backdropEffect) return;
  effectCleanup = props.backdropEffect(backdropEl.value);
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      // React: useLayoutEffect(() => activeElement?.blur(), [open])
      (document.activeElement as HTMLElement | null)?.blur();
      attachKeydown();
      await nextTick();
      runBackdropEffect();
    } else {
      detachKeydown();
      if (typeof effectCleanup === "function") effectCleanup();
      effectCleanup = undefined;
    }
  },
  { immediate: true },
);

watch(() => props.backdropEffect, runBackdropEffect);

onBeforeUnmount(() => {
  detachKeydown();
  if (typeof effectCleanup === "function") effectCleanup();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open"
      ref="backdropEl"
      :data-finch-modal-shell="'true'"
      :class="modalBackdropClassName(props.backdropClassName)"
      :style="{ zIndex: props.zIndex }"
      @click="props.closeOnBackdrop ? emit('close') : undefined"
    >
      <div
        v-if="props.backdropOnly"
        class="h-full w-full"
        :role="props.role ?? 'dialog'"
        aria-modal="true"
        :aria-label="props.ariaLabel ?? props.title"
      >
        <slot />
      </div>
      <div
        v-else
        :class="modalShellClassName(props.shellClassName)"
        @click.stop
        :role="props.role ?? 'dialog'"
        aria-modal="true"
        :aria-label="props.ariaLabel ?? props.title"
      >
        <div v-if="!props.noHeader && (props.title || props.headerRight)" :class="MODAL_HEADER_CLASS">
          <h2 v-if="props.title" :class="MODAL_TITLE_CLASS">{{ props.title }}</h2>
          <span v-else />
          <div :class="MODAL_HEADER_RIGHT_CLASS">
            <slot name="headerRight" />
            <Button :title="props.closeLabel" :aria-label="props.closeLabel" @click="emit('close')">
              <template #icon><LucideIcon name="x" :size="17" /></template>
            </Button>
          </div>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
