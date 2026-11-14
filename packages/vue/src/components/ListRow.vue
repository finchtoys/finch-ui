<script setup lang="ts">
import {
  LIST_ROW_ICON_CLASS,
  LIST_ROW_RIGHT_CLASS,
  LIST_ROW_SUBTITLE_CLASS,
  LIST_ROW_TITLE_WRAP_CLASS,
  listRowClassName,
  listRowFloatClassName,
  listRowFloatOverlayClassName,
  listRowMetaClassName,
  listRowTitleClassName,
} from "@shared/classes";

const props = withDefaults(
  defineProps<{
    title?: string;
    titleMono?: boolean;
    floatVisible?: boolean;
    tooltip?: string;
    indent?: number;
    draggable?: boolean;
    isActive?: boolean;
    rowKey?: string;
    clickable?: boolean;
  }>(),
  { titleMono: false, floatVisible: false, isActive: false, draggable: false, clickable: false },
);

const emit = defineEmits<{ click: [event: { shiftKey: boolean }]; contextmenu: [event: MouseEvent] }>();

function onClick(event: MouseEvent) {
  if (!props.clickable) return;
  emit("click", { shiftKey: event.shiftKey });
}

function onKeyDown(event: KeyboardEvent) {
  if (!props.clickable) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    emit("click", { shiftKey: event.shiftKey });
  }
}
</script>

<template>
  <div
    :role="props.clickable ? 'button' : undefined"
    :tabindex="props.clickable ? 0 : undefined"
    :class="listRowClassName({ isActive: props.isActive, hasIcon: !!$slots.icon, hasInteraction: props.clickable })"
    :title="props.tooltip"
    :data-row-key="props.rowKey"
    :draggable="props.draggable"
    @click="onClick"
    @contextmenu="props.clickable ? emit('contextmenu', $event) : undefined"
    @keydown="onKeyDown"
  >
    <span
      v-if="$slots.icon"
      :class="LIST_ROW_ICON_CLASS"
      :style="props.indent && props.indent > 0 ? { marginLeft: `${props.indent}px` } : undefined"
    >
      <slot name="icon" />
    </span>

    <div :class="LIST_ROW_TITLE_WRAP_CLASS">
      <div
        :class="listRowTitleClassName({ hoverFade: !!$slots.meta || !!$slots.float || props.floatVisible, mono: props.titleMono })"
        :style="!$slots.icon && props.indent && props.indent > 0 ? { marginLeft: `${props.indent}px` } : undefined"
      >
        <slot name="title">{{ props.title }}</slot>
      </div>
      <div v-if="$slots.subtitle" :class="LIST_ROW_SUBTITLE_CLASS"><slot name="subtitle" /></div>
    </div>

    <span v-if="$slots.meta" :class="LIST_ROW_RIGHT_CLASS" style="min-width: 20px">
      <span :class="listRowMetaClassName({ hasFloat: !!$slots.float, floatVisible: props.floatVisible })">
        <slot name="meta" />
      </span>
      <span v-if="$slots.float" :class="listRowFloatClassName({ floatVisible: props.floatVisible })">
        <slot name="float" />
      </span>
    </span>
    <span
      v-else-if="$slots.float"
      :class="listRowFloatOverlayClassName({ floatVisible: props.floatVisible })"
    >
      <slot name="float" />
    </span>

    <slot />
  </div>
</template>
