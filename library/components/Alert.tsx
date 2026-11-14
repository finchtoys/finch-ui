import type { CSSProperties, ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import {
  ALERT_BODY_CLASS,
  ALERT_CONTENT_CLASS,
  ALERT_CUSTOM_ICON_CLASS,
  ALERT_ICON_CLASS,
  ALERT_TITLE_CLASS,
  alertClassName,
  alertVariantStyle,
} from "../styles/classes";
import type { AlertVariant } from "../styles/classes";

export interface AlertProps {
  variant?: AlertVariant;
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

function defaultIcon(variant: AlertVariant): ReactNode {
  const props = { size: 15, strokeWidth: 1.8, className: ALERT_ICON_CLASS };
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
      style={alertVariantStyle(variant) as CSSProperties}
      className={alertClassName(className)}
    >
      {/* 默认图标自带 mt-0.5 / flex-none；自定义图标在这里补同一套，
          否则行内传入的 svg 既会和首行文字对不齐，又可能被 flex 压扁。 */}
      {icon
        ? <span className={ALERT_CUSTOM_ICON_CLASS}>{icon}</span>
        : defaultIcon(variant)}
      <div className={ALERT_BODY_CLASS}>
        {title && (
          <div
            className={ALERT_TITLE_CLASS}
            style={variant === "info" ? { color: "var(--ui-info-strong)" } : undefined}
          >
            {title}
          </div>
        )}
        <div className={ALERT_CONTENT_CLASS}>{children}</div>
      </div>
    </div>
  );
}
