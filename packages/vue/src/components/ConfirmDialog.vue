<script setup lang="ts">
/** Vue port of ConfirmDialog.tsx (ModalShell + buttons). */
import {
  CONFIRM_ACTION_CLASS,
  CONFIRM_CLOSE_BUTTON_CLASS,
  CONFIRM_DESCRIPTION_CLASS,
  CONFIRM_FOOTER_CLASS,
  CONFIRM_TITLE_CLASS,
  confirmBodyClassName,
  confirmContentClassName,
  confirmShellClassName,
} from "@shared/classes";
import Button from "./Button.vue";
import ModalShell from "./ModalShell.vue";
import ScrollArea from "./ScrollArea.vue";
import LucideIcon from "../icons/LucideIcon.vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    titleClassName?: string;
    description?: string;
    shellClassName?: string;
    contentClassName?: string;
    bodyClassName?: string;
    zIndex?: number;
    confirmLabel: string;
    cancelLabel: string;
    closeLabel: string;
    variant?: "danger" | "primary";
    pending?: boolean;
    showCancelButton?: boolean;
    showCloseButton?: boolean;
    hideTitle?: boolean;
  }>(),
  {
    zIndex: 300,
    variant: "primary",
    pending: false,
    showCancelButton: true,
    showCloseButton: false,
    hideTitle: false,
  },
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <ModalShell
    :open="props.open"
    :no-header="true"
    role="alertdialog"
    :aria-label="props.title"
    :close-label="props.closeLabel"
    :shell-class-name="confirmShellClassName(props.shellClassName)"
    :z-index="props.zIndex"
    @close="emit('cancel')"
  >
    <Button
      v-if="props.showCloseButton"
      :class="CONFIRM_CLOSE_BUTTON_CLASS"
      variant="ghost"
      :title="props.closeLabel"
      :aria-label="props.closeLabel"
      @click="emit('cancel')"
    >
      <template #icon><LucideIcon name="x" :size="16" /></template>
    </Button>
    <div :class="confirmBodyClassName({ showCloseButton: props.showCloseButton, hideTitle: props.hideTitle, bodyClassName: props.bodyClassName })">
      <p v-if="!props.hideTitle" :class="props.titleClassName ?? CONFIRM_TITLE_CLASS">{{ props.title }}</p>
      <ScrollArea v-if="$slots.default" :class="confirmContentClassName({ contentClassName: props.contentClassName, hideTitle: props.hideTitle })">
        <slot />
      </ScrollArea>
      <p v-else-if="props.description" :class="CONFIRM_DESCRIPTION_CLASS">{{ props.description }}</p>
    </div>
    <div :class="CONFIRM_FOOTER_CLASS">
      <Button v-if="props.showCancelButton" variant="secondary" size="md" :class="CONFIRM_ACTION_CLASS" @click="emit('cancel')">
        {{ props.cancelLabel }}
      </Button>
      <Button
        :variant="props.variant"
        size="md"
        :class="CONFIRM_ACTION_CLASS"
        :disabled="props.pending"
        :aria-busy="props.pending"
        @click="emit('confirm')"
      >
        <template v-if="props.pending" #leading>
          <LucideIcon name="loader-circle" :size="14" class="animate-spin" />
        </template>
        {{ props.confirmLabel }}
      </Button>
    </div>
  </ModalShell>
</template>
