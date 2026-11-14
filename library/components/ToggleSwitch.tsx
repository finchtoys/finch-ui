interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  size = "md",
  disabled = false,
  className = "",
}: ToggleSwitchProps) {
  const trackW = size === "sm" ? 32 : 42;
  const trackH = size === "sm" ? 18 : 22;
  const thumb = size === "sm" ? 12 : 16;
  const pad = (trackH - thumb) / 2 + 1;
  const trackColor = disabled
    ? "color-mix(in srgb, var(--ui-text-tertiary) 52%, var(--ui-bg-inset))"
    : checked
      ? "var(--ui-accent)"
      : "var(--ui-bg-inset)";

  return (
    <button
      className={`relative flex-none shrink-0 rounded-full outline-none transition-opacity duration-120 focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-sf ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`.trim()}
      style={{
        width: trackW + "px",
        height: trackH + "px",
        backgroundColor: trackColor,
        border: "1px solid color-mix(in srgb, var(--ui-border) 70%, transparent)",
        transition: "background-color 200ms ease",
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onChange();
      }}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      type="button"
    >
      <span
        className="absolute top-1/2 rounded-full shadow-sm"
        style={{
          width: thumb,
          height: thumb,
          backgroundColor: "var(--ui-fg-primary)",
          left: checked ? trackW - pad - thumb : pad,
          transform: "translateY(-50%)",
          transition: "left 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </button>
  );
}
