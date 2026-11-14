import { useEffect, useState } from "react";

// Ticks `Date.now()` every `delay` ms, but suspends the interval while the
// document is hidden. Chromium throttles background setInterval to ~1s, but
// fully stopping the timer also prevents the React state churn that keeps the
// compositor/GPU busy on every tick.
export function useVisibleNow(delay: number, enabled: boolean = true): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    let timer: number | null = null;
    const start = () => {
      if (timer != null) return;
      timer = window.setInterval(() => setNow(Date.now()), delay);
    };
    const stop = () => {
      if (timer != null) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    if (document.visibilityState !== "hidden") start();
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        stop();
      } else {
        setNow(Date.now());
        start();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, [delay, enabled]);

  return now;
}
