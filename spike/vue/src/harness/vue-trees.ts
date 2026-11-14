import { defineComponent, h, ref } from "vue";
import type { VNode } from "vue";
import Button from "../vue/Button.vue";
import Input from "../vue/Input.vue";
import ToggleSwitch from "../vue/ToggleSwitch.vue";
import ModalShell from "../vue/ModalShell.vue";
import MenuPopover from "../vue/MenuPopover.vue";
import MenuItem from "../vue/MenuItem.vue";
import StarIcon from "../vue/StarIcon.vue";

/**
 * Vue trees for every scenario — structurally identical to react-trees.tsx.
 * The 5 components themselves are SFCs; only this glue uses h(), because the
 * harness has to build trees from data.
 */

const PANEL_BODY = h("p", { class: "m-0 px-5 pt-4 pb-5 text-[14px] text-txt" }, "Modal body copy.");

function menuContents(): VNode[] {
  return [
    h(MenuItem, null, { icon: () => h(StarIcon, { size: 14 }), default: () => "重命名" }),
    h(MenuItem, { active: true }, { default: () => "复制" }),
    h(MenuItem, { danger: true }, { default: () => "删除" }),
    h(MenuItem, { separator: true }),
    h(MenuItem, null, {
      trailing: () => h("span", { class: "text-[12px] text-txt-tertiary" }, "⌘K"),
      default: () => "偏好设置",
    }),
  ];
}

function MenuScenario(props: {
  placement?: "bottom-start" | "top-start" | "right-start";
  point?: { x: number; y: number } | null;
  nested?: boolean;
  atBottom?: boolean;
}) {
  return defineComponent({
    setup() {
      const open = ref(true);
      const anchorEl = ref<HTMLButtonElement | null>(null);

      const anchor = () =>
        h(
          "button",
          {
            id: "anchor",
            ref: anchorEl,
            type: "button",
            onClick: () => (open.value = !open.value),
            class:
              "h-[28px] rounded-[var(--ui-radius-sm)] border border-border-subtle bg-sf-elevated px-3 text-[13px] text-txt",
          },
          "测试菜单",
        );

      return () =>
        h("div", { class: "flex flex-col gap-3 p-6", style: { minHeight: "100%" } }, [
          h("div", { class: "text-[13px] text-txt-secondary" }, "Menu"),
          props.nested
            ? h(
                "div",
                {
                  id: "scroller",
                  class: "rounded-md border border-border-subtle",
                  style: { height: "120px", overflow: "auto", padding: "8px" },
                },
                [h("div", { style: { height: "40px" } }), anchor(), h("div", { style: { height: "500px" } })],
              )
            : h(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: props.atBottom ? "flex-end" : "flex-start",
                    minHeight: props.atBottom ? "calc(100vh - 150px)" : undefined,
                  },
                },
                [anchor()],
              ),
          h(
            MenuPopover,
            {
              open: open.value,
              onClose: () => (open.value = false),
              getAnchor: props.point ? undefined : () => anchorEl.value,
              anchorPoint: props.point ?? null,
              placement: props.placement ?? "bottom-start",
            },
            { default: menuContents },
          ),
          h(
            "p",
            { class: "m-0 max-w-[420px] text-[12px] text-txt-tertiary" },
            "菜单挂载到 document.body，定位为 fixed，越过 scroller 的 overflow 裁切。",
          ),
        ]);
    },
  });
}

function ModalScenario(props: { mode: "default" | "noHeader" | "headerRight"; closeOnBackdrop?: boolean }) {
  return defineComponent({
    setup() {
      const open = ref(true);
      return () =>
        h("div", { class: "p-6 text-[13px] text-txt-secondary" }, [
          h("div", null, "ModalShell"),
          h("button", { type: "button", onClick: () => (open.value = true), class: "mt-2 underline" }, "重新打开"),
          h(
            ModalShell,
            {
              open: open.value,
              onClose: () => (open.value = false),
              title: props.mode === "noHeader" ? "无表头" : "设置",
              closeLabel: "关闭",
              noHeader: props.mode === "noHeader",
              closeOnBackdrop: props.closeOnBackdrop,
              headerRight: props.mode === "headerRight",
              shellClassName: props.mode === "noHeader" ? "spike-modal spike-modal--narrow" : "spike-modal",
            },
            {
              // React takes `headerRight` as a node prop; Vue takes a slot. A
              // slot that is always declared is therefore always rendered —
              // pass it only when the scenario asks for it.
              ...(props.mode === "headerRight"
                ? { headerRight: () => h("span", { class: "text-[12px] text-txt-tertiary" }, "自定义") }
                : {}),
              default: () => PANEL_BODY,
            },
          ),
        ]);
    },
  });
}

function NestedModalScenario() {
  return defineComponent({
    setup() {
      const outer = ref(true);
      const inner = ref(true);
      return () =>
        h("div", { class: "p-6 text-[13px] text-txt-secondary" }, [
          h("div", null, "嵌套 Modal"),
          h(
            ModalShell,
            {
              open: outer.value,
              onClose: () => (outer.value = false),
              title: "外层",
              closeLabel: "关闭",
              zIndex: 200,
              shellClassName: "spike-modal",
            },
            { default: () => PANEL_BODY },
          ),
          h(
            ModalShell,
            {
              open: inner.value,
              onClose: () => (inner.value = false),
              title: "内层",
              closeLabel: "关闭",
              zIndex: 201,
              shellClassName: "spike-modal spike-modal--narrow",
            },
            { default: () => PANEL_BODY },
          ),
        ]);
    },
  });
}

const star = (size: number) => () => h(StarIcon, { size });

export const vueTrees: Record<string, () => VNode> = {
  "btn-primary": () => h(Button, { variant: "primary" }, { default: () => "主要" }),
  "btn-brand": () => h(Button, { variant: "brand" }, { default: () => "品牌" }),
  "btn-secondary": () => h(Button, { variant: "secondary" }, { default: () => "次要" }),
  "btn-ghost": () => h(Button, { variant: "ghost" }, { default: () => "幽灵" }),
  "btn-outline": () => h(Button, { variant: "outline" }, { default: () => "描边" }),
  "btn-danger": () => h(Button, { variant: "danger" }, { default: () => "删除" }),
  "btn-link": () => h(Button, { variant: "link" }, { default: () => "链接" }),
  "btn-secondary-sm": () => h(Button, { variant: "secondary", size: "sm" }, { default: () => "小号" }),
  "btn-secondary-lg": () => h(Button, { variant: "secondary", size: "lg" }, { default: () => "大号" }),
  "btn-round-md": () => h(Button, { variant: "secondary", round: "md" }, { default: () => "中圆角" }),
  "btn-round-full": () => h(Button, { variant: "secondary", round: "full" }, { default: () => "全圆角" }),
  "btn-icon-ghost": () =>
    h(Button, { "aria-label": "收藏" }, { icon: () => h(StarIcon, { size: 16 }) }),
  "btn-icon-primary": () =>
    h(Button, { variant: "primary", "aria-label": "收藏" }, { icon: () => h(StarIcon, { size: 16 }) }),
  "btn-icon-danger": () =>
    h(Button, { variant: "danger", "aria-label": "删除" }, { icon: () => h(StarIcon, { size: 16 }) }),
  "btn-pressed": () =>
    h(Button, { variant: "ghost", pressed: true, "aria-label": "固定" }, { default: () => "已按下" }),
  "btn-disabled": () => h(Button, { variant: "primary", disabled: true }, { default: () => "禁用" }),
  "btn-span": () =>
    h(Button, { as: "span", variant: "secondary", disabled: true }, { default: () => "内联按钮" }),
  "btn-with-icons": () =>
    h(Button, { variant: "secondary" }, {
      leading: star(14),
      default: () => "带图标",
      trailing: star(14),
    }),

  "input-default": () =>
    h(Input, { label: "名称", hint: "显示在列表里", placeholder: "输入名称", modelValue: "Finch" }),
  "input-error": () =>
    h(Input, { label: "名称", error: "必填", placeholder: "输入名称", modelValue: "" }),
  "input-ghost": () => h(Input, { variant: "ghost", placeholder: "幽灵输入", modelValue: "ghost" }),
  "input-plain": () => h(Input, { variant: "plain", placeholder: "无边框", modelValue: "plain" }),
  "input-mono-sm": () => h(Input, { mono: true, size: "sm", modelValue: "npm i @finchtoys/ui" }),
  "input-lg": () => h(Input, { size: "lg", round: "lg", label: "大号", modelValue: "large" }),
  "input-adornment": () =>
    h(Input, { label: "搜索", modelValue: "finch" }, {
      endAdornment: () => h("span", { class: "text-[12px] text-txt-tertiary" }, "⌘K"),
    }),

  "toggle-off": () => h(ToggleSwitch, { checked: false, onChange: () => {} }),
  "toggle-on": () => h(ToggleSwitch, { checked: true, onChange: () => {} }),
  "toggle-sm-on": () => h(ToggleSwitch, { size: "sm", checked: true, onChange: () => {} }),
  "toggle-disabled": () => h(ToggleSwitch, { checked: true, disabled: true, onChange: () => {} }),

  "modal-default": () => h(ModalScenario({ mode: "default" })),
  "modal-noheader": () => h(ModalScenario({ mode: "noHeader" })),
  "modal-header-right": () => h(ModalScenario({ mode: "headerRight" })),
  "modal-close-on-backdrop": () => h(ModalScenario({ mode: "default", closeOnBackdrop: true })),
  "modal-nested": () => h(NestedModalScenario()),

  "menu-bottom-start": () => h(MenuScenario({ nested: true })),
  "menu-top-flip": () => h(MenuScenario({ atBottom: true })),
  "menu-right-start": () => h(MenuScenario({ placement: "right-start" })),
  "menu-anchor-point": () => h(MenuScenario({ nested: true, point: { x: 260, y: 260 } })),
};
