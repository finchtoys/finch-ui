import { memo } from "react";

export interface TypingDotsProps {
  /**
   * 圆点尺寸：`default` 是运行提示气泡里的 5px 圆点；`small` 是宽度受限的
   * 3px 提示；`tiny` 是贴在 32px 头像内下沿的 2px 版本。三者的跳动动画共用
   * 同一份 keyframes，尺寸差异只由 `size` 决定。
   */
  size?: "default" | "small" | "tiny";
  className?: string;
}

/**
 * 三个跳动的圆点，表示「仍在处理」。运行提示气泡和运行头像共用同一份标记，
 * 尺寸差异只由 `size` 决定，避免同一套动画在两处各写一遍。
 */
export const TypingDots = memo(function TypingDots({ size = "default", className }: TypingDotsProps) {
  return (
    <span
      className={`runningDots${size === "small" ? " runningDots--small" : ""}${size === "tiny" ? " runningDots--tiny" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  );
});
