import { Button } from "@baseline/components/Button";
import { Input } from "@baseline/components/Input";
import { ToggleSwitch } from "@baseline/components/ToggleSwitch";
import { ModalShell } from "@baseline/components/ModalShell";
import { MenuItem, MenuPopover, MenuSeparator, MenuSubmenu } from "@baseline/components/Menu";
import { Tooltip } from "@baseline/components/Tooltip";
import { HoverCard } from "@baseline/components/HoverCard";
import { ConfirmDialog } from "@baseline/components/ConfirmDialog";
import { createReactTrees } from "./react-trees";

/**
 * The SAME components as they were before the class-string extraction.
 *
 * `@baseline` points at a git worktree of the pre-refactor commit
 * (`.baseline/<sha>/library`, created by `npm run baseline`) — see
 * docs/vue-spike-findings.md §5.5. Rendering both trees in one page is what
 * turns "the refactor changed nothing" from a claim into a measurement.
 */
export const baselineReactTrees = createReactTrees({
  Button,
  Input,
  ToggleSwitch,
  ModalShell,
  MenuItem,
  MenuPopover,
  MenuSeparator,
  MenuSubmenu,
  Tooltip,
  HoverCard,
  ConfirmDialog,
});
