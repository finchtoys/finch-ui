import {
  TOGGLE_SWITCH_THUMB_CLASS,
  toggleSwitchClassName,
  toggleSwitchThumbStyle,
  toggleSwitchTrackStyle,
} from "../styles/classes";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

/**
 * Track/thumb geometry and colours are inline styles, so they live in
 * styles/classes.ts as CSS strings (`"42px"`), not numbers: React appends `px`
 * to numbers but a second renderer may not.
 */
export function ToggleSwitch({
  checked,
  onChange,
  size = "md",
  disabled = false,
  className = "",
}: ToggleSwitchProps) {
  return (
    <button
      className={toggleSwitchClassName({ disabled, className })}
      style={toggleSwitchTrackStyle({ size, checked, disabled })}
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
        className={TOGGLE_SWITCH_THUMB_CLASS}
        style={toggleSwitchThumbStyle({ size, checked })}
      />
    </button>
  );
}
