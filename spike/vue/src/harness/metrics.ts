/**
 * Computed-style sampling. Property list is deliberately long: the whole point
 * of the spike is "same stylesheet + same class strings ⇒ same computed style",
 * so a short list would make the claim unfalsifiable.
 */
export const STYLE_PROPS = [
  // box
  "display",
  "position",
  "width",
  "height",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "box-sizing",
  "gap",
  "align-items",
  "justify-content",
  // border / radius
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "outline-style",
  "outline-width",
  // type
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-decoration-line",
  "white-space",
  "text-overflow",
  // color / paint
  "color",
  "background-color",
  "background-image",
  "box-shadow",
  "opacity",
  "visibility",
  "z-index",
  "backdrop-filter",
  "overflow-x",
  "overflow-y",
  // interaction / motion
  "cursor",
  "pointer-events",
  "user-select",
  "transition-property",
  "transition-duration",
  "transition-timing-function",
  "animation-name",
  "animation-duration",
  "transform",
] as const;

export interface Sample {
  key: string;
  tag: string;
  className: string;
  classTokens: string[];
  attrs: Record<string, string | null>;
  rect: { x: number; y: number; width: number; height: number };
  style: Record<string, string>;
}

export interface SampleSpec {
  key: string;
  selector: string;
  /** Sub-index when the selector matches several nodes (e.g. nested modals). */
  index?: number;
}

const ATTR_NAMES = ["role", "aria-label", "aria-modal", "aria-checked", "aria-pressed", "aria-disabled", "aria-invalid", "tabindex", "type", "disabled", "data-menu-panel", "data-finch-modal-shell"];

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function sampleElement(el: Element, key: string): Sample {
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const style: Record<string, string> = {};
  for (const prop of STYLE_PROPS) style[prop] = cs.getPropertyValue(prop);

  const attrs: Record<string, string | null> = {};
  for (const name of ATTR_NAMES) attrs[name] = el.getAttribute(name);

  const className = el.getAttribute("class") ?? "";
  return {
    key,
    tag: el.tagName.toLowerCase(),
    className,
    classTokens: className.split(/\s+/).filter(Boolean),
    attrs,
    rect: {
      x: round(rect.x),
      y: round(rect.y),
      width: round(rect.width),
      height: round(rect.height),
    },
    style,
  };
}

export function sampleSpec(spec: SampleSpec): Sample[] {
  const nodes = [...document.querySelectorAll(spec.selector)];
  if (!nodes.length) return [];
  if (spec.index !== undefined) {
    const el = nodes[spec.index];
    return el ? [sampleElement(el, spec.key)] : [];
  }
  return nodes.map((el, index) => sampleElement(el, nodes.length > 1 ? `${spec.key}[${index}]` : spec.key));
}
