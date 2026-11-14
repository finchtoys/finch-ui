import { Children, type ReactNode } from "react";
import { KBD_CLASS, KBD_SYMBOL_CLASS, kbdClassName } from "../styles/classes";

const KEY_SYMBOL = /^[⌘⌥⇧⌃↵↑↓←→]$/;

function renderKeys(children: ReactNode): ReactNode {
  const nodes = Children.toArray(children);
  // 合并相邻文字，兼容 <Kbd>{MOD}B</Kbd> 等组合写法；自定义节点保持原样。
  if (!nodes.every((node) => typeof node === "string" || typeof node === "number")) return children;
  const text = nodes.join("");
  const parts = text.split(/([⌘⌥⇧⌃↵↑↓←→])/).filter(Boolean);
  if (!parts.some((part) => KEY_SYMBOL.test(part))) return children;
  return parts.map((part, index) => (
    <span key={index} className={KEY_SYMBOL.test(part) ? KBD_SYMBOL_CLASS : undefined}>
      {part}
    </span>
  ));
}

export function Kbd({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={kbdClassName(className)}>
      {renderKeys(children)}
    </kbd>
  );
}

export { KBD_CLASS };
