import { useEffect, useRef, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { MenuPanel } from "./Menu";
import { Button } from "./Button";
import { ScrollArea } from "./ScrollArea";

interface TimePickerProps {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  /**
   * Plain mode — renders a transparent borderless trigger (for use inside
   * prop rows). Standard mode renders a bordered button with a clock icon.
   */
  plain?: boolean;
  disabled?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
/** 5-minute intervals: 00, 05, 10 … 55 */
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
/** Approximate row height used to pre-scroll the list. */
const ITEM_H = 34;

/**
 * Standalone time-picker with a scrollable hour + minute column popup.
 *
 * Drop it anywhere a HH:MM selector is needed. Use `plain` inside prop rows
 * (borderless trigger, value + chevron style) and the default for standalone use.
 */
export function TimePicker({
  hour,
  minute,
  onChange,
  plain = false,
  disabled = false,
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minScrollRef = useRef<HTMLDivElement>(null);

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");

  // Pre-scroll to selected item each time the popup opens
  useEffect(() => {
    if (!open) return;
    const minIdx = MINUTES.indexOf(minute);
    requestAnimationFrame(() => {
      if (hourScrollRef.current) {
        hourScrollRef.current.scrollTop = Math.max(0, hour * ITEM_H - ITEM_H * 2);
      }
      if (minScrollRef.current) {
        minScrollRef.current.scrollTop = Math.max(0, (minIdx >= 0 ? minIdx : 0) * ITEM_H - ITEM_H * 2);
      }
    });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  const toggleOpen = () => {
    if (!disabled) setOpen((o) => !o);
  };

  const setHour = (h: number) => onChange(h, minute);
  const setMinute = (m: number) => {
    onChange(hour, m);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative inline-block ${className ?? ""}`}>
      {plain ? (
        // Plain trigger — mirror ModelPicker's compact ghost button
        <Button
          variant="ghost"
          size="sm"
          pressed={open}
          trailingIcon={<ChevronDown size={14} className={`shrink-0 text-[var(--ui-text-tertiary)] transition-transform duration-120 ${open ? "rotate-180" : ""}`} strokeWidth={2} />}
          disabled={disabled}
          onClick={toggleOpen}
          aria-expanded={open}
          className="!h-auto min-w-0 gap-1.5 !px-2 !py-1 !text-[14px] !text-[var(--ui-text-secondary)] tabular-nums hover:!text-[var(--ui-text-primary)]"
        >
          {hh}:{mm}
        </Button>
      ) : (
        // Standard trigger — secondary style with open-state ring
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<Clock size={14} className="shrink-0 text-[var(--ui-text-tertiary)]" strokeWidth={1.9} />}
          disabled={disabled}
          onClick={toggleOpen}
          aria-expanded={open}
          className={[
            "tabular-nums !text-[13.5px] !px-2.5",
            open
              ? "!border-[color-mix(in_srgb,var(--ui-accent)_60%,transparent)] ring-2 ring-[color-mix(in_srgb,var(--ui-accent)_15%,transparent)]"
              : "",
          ].join(" ")}
        >
          {hh}:{mm}
        </Button>
      )}

      {open && (
        <MenuPanel className="absolute left-0 top-[calc(100%+6px)] z-50 flex gap-1 p-2 min-w-0">
          {/* Hours column */}
          <div className="flex flex-col">
            <span className="mb-1.5 text-center text-[12px] font-semibold uppercase tracking-widest text-[var(--ui-text-tertiary)] select-none">
              时
            </span>
            <ScrollArea
              ref={hourScrollRef}
              topFadeSize={10}
              bottomFadeSize={10}
              className="h-[168px] w-[52px] flex flex-col gap-0.5"
            >
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHour(h)}
                  className={`menuActionRow h-auto max-h-[16px] justify-center !py-[7px] !px-0 w-[52px] shrink-0 font-mono !text-[13px] !font-normal ${h === hour ? "menuActionRow--active" : ""}`}
                >
                  {String(h).padStart(2, "0")}
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Minutes column */}
          <div className="flex flex-col">
            <span className="mb-1.5 text-center text-[12px] font-semibold uppercase tracking-widest text-[var(--ui-text-tertiary)] select-none">
              分
            </span>
            <ScrollArea
              ref={minScrollRef}
              topFadeSize={10}
              bottomFadeSize={10}
              className="h-[168px] w-[52px] flex flex-col gap-0.5"
            >
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinute(m)}
                  className={`menuActionRow h-auto max-h-[16px] justify-center !py-[7px] !px-0 w-[52px] shrink-0 font-mono !text-[13px] !font-normal ${m === minute ? "menuActionRow--active" : ""}`}
                >
                  {String(m).padStart(2, "0")}
                </button>
              ))}
            </ScrollArea>
          </div>
        </MenuPanel>
      )}
    </div>
  );
}
