/**
 * Select trigger metrics are part of the shared presentation facts now, so the
 * class strings live in styles/classes.ts (single source for every renderer).
 * Kept as a re-export because components and downstream code import this path.
 */
export {
  SELECT_TRIGGER_SIZE,
  SELECT_CHEVRON_ROUND,
  selectValueClass,
  selectValueText,
  selectChevronClass,
} from "../styles/classes";
export type { SelectTriggerMetrics } from "../styles/classes";
