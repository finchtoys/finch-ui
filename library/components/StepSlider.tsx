import {
  STEP_SLIDER_FILL_CLASS,
  STEP_SLIDER_LABELS_ROW_CLASS,
  STEP_SLIDER_ROOT_CLASS,
  STEP_SLIDER_THUMB_CLASS,
  STEP_SLIDER_TRACK_CLASS,
  stepSliderDotClassName,
  stepSliderLabelClassName,
} from "../styles/classes";

interface StepSliderProps<T extends string> {
  steps: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
  showFill?: boolean;
}

export function StepSlider<T extends string>({ steps, labels, value, onChange, showFill = true }: StepSliderProps<T>) {
  const activeIndex = steps.indexOf(value);
  const pct = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div className={STEP_SLIDER_ROOT_CLASS} role="group">
      <div className={STEP_SLIDER_LABELS_ROW_CLASS}>
        {steps.map((step, i) => {
          const isActive = value === step;
          return (
            <button
              key={step}
              type="button"
              className={stepSliderLabelClassName(isActive)}
              style={{ left: `${(i / (steps.length - 1)) * 100}%` }}
              onClick={() => onChange(step)}
            >
              {labels[step]}
            </button>
          );
        })}
      </div>
      <div className={STEP_SLIDER_TRACK_CLASS}>
        {showFill && <div className={STEP_SLIDER_FILL_CLASS} style={{ width: `${pct}%` }} />}
        <div
          className={STEP_SLIDER_THUMB_CLASS}
          style={{ left: `${pct}%` }}
        />
        {steps.map((step, i) => {
          const isActive = value === step;
          return (
            <button
              key={step}
              type="button"
              className={stepSliderDotClassName(isActive)}
              style={{ left: `${(i / (steps.length - 1)) * 100}%` }}
              onClick={() => onChange(step)}
              aria-pressed={isActive}
            />
          );
        })}
      </div>
    </div>
  );
}
