import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { INPUT_BASE_CLASS, INPUT_ROUND_CLASS, inputStateClass, type InputRound, type InputVariant } from "./Input";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  unstyled?: boolean;
  variant?: InputVariant;
  round?: InputRound;
  error?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className = "", unstyled = false, variant = "default", round = "md", error = false, ...props },
  ref,
) {
  const baseClass = [
    // 默认不给右下角拖拽手柄：多行输入框在弹窗/面板里被拖到变形的概率远高于
    // 真需要它；要放开由调用方自己传 style={{ resize: "vertical" }}（行内样式
    // 覆盖类，不依赖 Tailwind 的出词顺序）。
    "appScrollbar block w-full resize-none",
    INPUT_BASE_CLASS,
    INPUT_ROUND_CLASS[round],
    inputStateClass({ error, variant }),
  ].join(" ");

  return (
    <textarea
      ref={ref}
      className={`p-1.5 ${unstyled ? "" : baseClass} ${className}`.trim()}
      {...props}
      aria-invalid={error || props["aria-invalid"]}
    />
  );
});
