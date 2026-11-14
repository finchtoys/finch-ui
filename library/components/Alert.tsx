import type { CSSProperties, ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

type AlertVariant = "info" | "warning" | "error" | "success";

export interface AlertProps {
  variant?: AlertVariant;
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const variantStyle: Record<AlertVariant, CSSProperties> = {
  info: {
    borderColor: "color-mix(in srgb, var(--ui-info) 34%, transparent)",
    background: "var(--ui-info-soft)",
    color: "var(--ui-text-secondary)",
  },
  warning: {
    borderColor: "color-mix(in srgb, var(--ui-warning) 34%, transparent)",
    background: "var(--ui-warning-dim)",
    color: "var(--ui-warning-text)",
  },
  error: {
    borderColor: "color-mix(in srgb, var(--ui-danger) 34%, transparent)",
    background: "var(--ui-danger-dim)",
    color: "var(--ui-danger-text)",
  },
  success: {
    borderColor: "color-mix(in srgb, var(--ui-positive) 34%, transparent)",
    background: "var(--ui-positive-dim)",
    color: "var(--ui-positive-text)",
  },
};

function defaultIcon(variant: AlertVariant): ReactNode {
  const props = { size: 15, strokeWidth: 1.8, className: "mt-0.5 flex-none" };
  if (variant === "warning") return <AlertTriangle {...props} />;
  if (variant === "error") return <AlertCircle {...props} />;
  if (variant === "success") return <CheckCircle2 {...props} />;
  // info 的正文色是次级灰，图标得取 `--ui-info-strong`（与 danger-text 同档），
  // 否则整块跟灰调信息卡没区别。
  return <Info {...props} style={{ color: "var(--ui-info-strong)" }} />;
}

export function Alert({ variant = "info", title, children, icon, className = "" }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      style={variantStyle[variant]}
      className={`flex shrink-0 items-start gap-2 rounded-[var(--ui-radius-md)] border px-3 py-2 text-[13px] leading-relaxed ${className}`}
    >
      {/* 默认图标自带 mt-0.5 / flex-none；自定义图标在这里补同一套，
          否则行内传入的 svg 既会和首行文字对不齐，又可能被 flex 压扁。 */}
      {icon
        ? <span className="mt-1.5 flex flex-none items-center">{icon}</span>
        : defaultIcon(variant)}
      <div className="min-w-0 flex-1">
        {title && (
          <div
            className="mb-1 font-semibold text-current"
            style={variant === "info" ? { color: "var(--ui-info-strong)" } : undefined}
          >
            {title}
          </div>
        )}
        <div className="select-text break-words text-current">{children}</div>
      </div>
    </div>
  );
}
