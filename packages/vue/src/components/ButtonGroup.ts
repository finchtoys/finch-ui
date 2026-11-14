/**
 * Vue port of ButtonGroup.tsx.
 *
 * React clones its child `<Button>` elements to inject group styling; Vue does
 * the same at the vnode level (`cloneVNode`), so `<ButtonGroup><Button/>…` keeps
 * working with no extra wrapper component.
 *
 * Limitation (see README): a `<Tooltip>`-wrapped button is not unwrapped here.
 */
import { cloneVNode, defineComponent, h, useSlots } from "vue";
import type { VNode } from "vue";
import { BUTTON_GROUP_ITEM_WRAP_CLASS, buttonGroupClassName, buttonGroupItemClassName } from "@shared/classes";
import type { ButtonRound, ButtonSize, ButtonVariant } from "@shared/classes";

export default defineComponent({
  name: "ButtonGroup",
  props: {
    variant: { type: String as () => ButtonVariant, default: "secondary" },
    size: { type: String as () => ButtonSize, default: "md" },
    round: { type: String as () => ButtonRound, default: "sm" },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const slot = useSlots();

    return () => {
      const nodes = (slot.default?.() ?? []).filter((node) => typeof node.type !== "symbol");
      const items = nodes.map((node: VNode, index) => {
        const childProps = (node.props ?? {}) as Record<string, unknown>;
        const childVariant = (childProps.variant as ButtonVariant | undefined) ?? props.variant;
        const childSize = (childProps.size as ButtonSize | undefined) ?? props.size;
        const childSlots = node.children as Record<string, unknown> | null;
        return h(
          "div",
          { class: BUTTON_GROUP_ITEM_WRAP_CLASS, key: index },
          [
            cloneVNode(node, {
              variant: childVariant,
              size: childSize,
              round: "sm",
              disabled: props.disabled || Boolean(childProps.disabled),
              class: buttonGroupItemClassName({
                variant: props.variant,
                index,
                iconMode: Boolean(childSlots && typeof childSlots === "object" && "icon" in childSlots),
                size: childSize,
                className: typeof childProps.class === "string" ? childProps.class : "",
              }),
            }),
          ],
        );
      });

      return h(
        "div",
        { class: buttonGroupClassName({ variant: props.variant, round: props.round, disabled: props.disabled }) },
        items,
      );
    };
  },
});
