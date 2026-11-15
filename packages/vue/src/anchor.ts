/**
 * 模板 ref 可能指向真实元素（`ref="x"` 落在原生标签上），也可能指向子组件实例
 * （落在 `<Button>` 这类组件上，此时元素在 `$el` 上）。两种都要能拿到锚点，
 * 否则 MenuPopover 拿不到 anchor，菜单会开了却定位不到、看不见。
 */
export type AnchorLike = HTMLElement | { $el?: unknown } | null | undefined;

export function resolveAnchor(refValue: AnchorLike): HTMLElement | null {
  if (!refValue) return null;
  if (refValue instanceof HTMLElement) return refValue;
  const el = (refValue as { $el?: unknown }).$el;
  return el instanceof HTMLElement ? el : null;
}
