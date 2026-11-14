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
    <div className="flex w-[160px] flex-col gap-2 px-1" role="group">
      <div className="relative h-[18px]">
        {steps.map((step, i) => {
          const isActive = value === step;
          return (
            <button
              key={step}
              type="button"
              className={[
                "absolute top-0 -translate-x-1/2 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 text-[13px] font-medium leading-[13px] text-[var(--ui-text-secondary)] transition-colors duration-150",
                isActive ? "font-semibold text-[var(--ui-accent)]" : "",
              ].filter(Boolean).join(" ")}
              style={{ left: `${(i / (steps.length - 1)) * 100}%` }}
              onClick={() => onChange(step)}
            >
              {labels[step]}
            </button>
          );
        })}
      </div>
      <div className="relative my-1.5 h-0.5 rounded-[1px] bg-[var(--ui-border-subtle)]">
        {showFill && <div className="absolute left-0 top-0 h-full rounded-[1px] bg-[var(--ui-accent)] transition-[width] duration-200 ease-in-out" style={{ width: `${pct}%` }} />}
        <div
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--ui-bg-elevated)] bg-[var(--ui-accent)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_20%,transparent)] transition-[left] duration-200 ease-in-out"
          style={{ left: `${pct}%` }}
        />
        {steps.map((step, i) => {
          const isActive = value === step;
          return (
            <button
              key={step}
              type="button"
              className={[
                "group absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-0 bg-transparent",
                "after:absolute after:left-1/2 after:top-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-[color-mix(in_srgb,var(--ui-accent)_80%,transparent)] after:transition-[background,transform] after:duration-150 hover:after:bg-[var(--ui-accent)] hover:after:scale-[1.3]",
                isActive ? "after:bg-transparent hover:after:bg-transparent hover:after:scale-100" : "",
              ].filter(Boolean).join(" ")}
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
