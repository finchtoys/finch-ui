export { default as Alert } from "./src/components/Alert.vue";
export { default as Badge } from "./src/components/Badge.vue";
export { default as Button } from "./src/components/Button.vue";
export { default as CheckBox } from "./src/components/CheckBox.vue";
export { default as Chip } from "./src/components/Chip.vue";
export { default as Empty } from "./src/components/Empty.vue";
export { default as FreeModelBadge } from "./src/components/FreeModelBadge.vue";
export { default as InlineActionLink } from "./src/components/InlineActionLink.vue";
export { default as Input } from "./src/components/Input.vue";
export { default as Kbd } from "./src/components/Kbd.vue";
export { default as ListRow } from "./src/components/ListRow.vue";
export { default as MenuItem } from "./src/components/MenuItem.vue";
export { default as MenuPopover } from "./src/components/MenuPopover.vue";
export { default as ModalShell } from "./src/components/ModalShell.vue";
export { default as OptionCard } from "./src/components/OptionCard.vue";
export { default as SegmentedControl } from "./src/components/SegmentedControl.vue";
export { default as SkeletonBlock } from "./src/components/SkeletonBlock.vue";
export { default as SkeletonCatalogCard } from "./src/components/SkeletonCatalogCard.vue";
export { default as SkeletonCatalogGrid } from "./src/components/SkeletonCatalogGrid.vue";
export { default as TextArea } from "./src/components/TextArea.vue";
export { default as ToggleSwitch } from "./src/components/ToggleSwitch.vue";
export { default as TypingDots } from "./src/components/TypingDots.vue";
export { default as WorkingText } from "./src/components/WorkingText.vue";

// Menu state helpers are plain TS and framework-neutral: the same singleton
// coordinates every open menu in the host document.
export { closeAllMenus, isAnyMenuOpen, bindMenuCloseOnFocus, subscribeMenuState, subscribeMenuCloseAll } from "@lib/components/menuState";

export type { AlertVariant, BadgeSize, BadgeVariant, ButtonRound, ButtonSize, ButtonVariant, CheckBoxRound, CheckBoxSize, InputRound, InputSize, InputVariant, MenuPlacement } from "@shared/classes";
