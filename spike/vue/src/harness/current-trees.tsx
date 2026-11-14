import { Button } from "@lib/components/Button";
import { Input } from "@lib/components/Input";
import { ToggleSwitch } from "@lib/components/ToggleSwitch";
import { ModalShell } from "@lib/components/ModalShell";
import { MenuItem, MenuPopover, MenuSeparator, MenuSubmenu } from "@lib/components/Menu";
import { Tooltip } from "@lib/components/Tooltip";
import { HoverCard } from "@lib/components/HoverCard";
import { ConfirmDialog } from "@lib/components/ConfirmDialog";
import { createReactTrees } from "./react-trees";

/** Current library components (HEAD of library/components). */
export const reactTrees = createReactTrees({
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
