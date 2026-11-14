export { default as ConfirmDialog } from "./src/components/ConfirmDialog.vue";
export { default as DialogMessage } from "./src/components/DialogMessage.vue";
export { default as DropdownSelect } from "./src/components/DropdownSelect.vue";
export { default as HoverCard } from "./src/components/HoverCard.vue";
export { default as IconTabBar } from "./src/components/IconTabBar.vue";
export { default as InlineSelect } from "./src/components/InlineSelect.vue";
export { default as InputSelect } from "./src/components/InputSelect.vue";
export { default as MultiSelect } from "./src/components/MultiSelect.vue";
export { default as ScrollArea } from "./src/components/ScrollArea.vue";
export { default as SearchField } from "./src/components/SearchField.vue";
export { default as SecretInput } from "./src/components/SecretInput.vue";
export { default as StepSlider } from "./src/components/StepSlider.vue";
export { default as TimePicker } from "./src/components/TimePicker.vue";
export { default as Tooltip } from "./src/components/Tooltip.vue";
export { default as Breadcrumb } from "./src/components/Breadcrumb.vue";
export { default as Alert } from "./src/components/Alert.vue";
export { default as Badge } from "./src/components/Badge.vue";
export { default as Button } from "./src/components/Button.vue";
export { default as ButtonGroup } from "./src/components/ButtonGroup";
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
export { default as MenuSubmenu } from "./src/components/MenuSubmenu.vue";
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
