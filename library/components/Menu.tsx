import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { menuStateClose, menuStateOpen, subscribeMenuCloseAll } from "./menuState";
import {
  MENU_OUT_DURATION,
  MENU_ITEM_TRAILING_CLASS,
  clampPosition,
  menuItemClassName,
  menuPanelClassName,
  menuPanelStyle,
  menuPosition,
  menuSeparatorClassName,
} from "../styles/classes";
import type { MenuPlacement, MenuPosition } from "../styles/classes";

interface MenuPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  closing?: boolean;
}

interface MenuPopoverProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  anchorRef?: RefObject<HTMLElement | null>;
  anchorPoint?: { x: number; y: number } | null;
  placement?: MenuPlacement;
  gap?: number;
  gutter?: number;
  className?: string;
  style?: CSSProperties;
}

interface MenuSubmenuProps {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
  side?: "left" | "right";
  /** Horizontal submenu uses center alignment by default; tall account menus may align to the trigger top. */
  verticalAlign?: "center" | "top";
  gap?: number;
  gutter?: number;
  /** Minimum height used only for viewport collision positioning; does not change panel layout. */
  positioningMinHeight?: number;
  onMouseEnter?: HTMLAttributes<HTMLDivElement>["onMouseEnter"];
  onMouseLeave?: HTMLAttributes<HTMLDivElement>["onMouseLeave"];
}

interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  danger?: boolean;
}

interface MenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export const MenuPanel = forwardRef<HTMLDivElement, MenuPanelProps>(function MenuPanel(
  { children, className = "", closing = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-menu-panel="true"
      className={menuPanelClassName(closing, className)}
      {...props}
    >
      {children}
    </div>
  );
});

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  {
    icon,
    trailing,
    active = false,
    danger = false,
    className = "",
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={menuItemClassName({ active, danger, className })}
      {...props}
    >
      {icon}
      {children}
      {trailing != null ? <span className={MENU_ITEM_TRAILING_CLASS}>{trailing}</span> : null}
    </button>
  );
});

export function MenuSeparator({ className = "", ...props }: MenuSeparatorProps) {
  return <div className={menuSeparatorClassName(className)} {...props} />;
}

export function MenuPopover({
  open,
  onClose,
  children,
  anchorRef,
  anchorPoint,
  placement = "bottom-start",
  gap = 0,
  gutter = 12,
  className,
  style,
}: MenuPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  // Tracks whether this instance has called menuStateOpen() without a matching
  // menuStateClose(). Prevents double-open when `open` toggles rapidly and
  // the close animation timer is cancelled by effect cleanup.
  const menuRegisteredRef = useRef(false);
  // 右键菜单靠屏幕坐标定位，滚动后就不再指向原来的位置，只能关掉；
  // 用 ref 持有最新回调，避免父组件每次渲染换函数导致定位副作用重跑。
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Unmount guard: release the count if this popover is removed while open.
  useEffect(() => {
    return () => {
      if (menuRegisteredRef.current) {
        menuStateClose();
        menuRegisteredRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (open) {
      if (!menuRegisteredRef.current) {
        menuStateOpen();
        menuRegisteredRef.current = true;
      }
      setIsClosing(false);
      setVisible(true);
    } else if (visible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
        setVisible(false);
        setPosition(null);
        if (menuRegisteredRef.current) {
          menuStateClose();
          menuRegisteredRef.current = false;
        }
      }, MENU_OUT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!visible || isClosing || !open) {
      if (!visible) setPosition(null);
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const updatePosition = () => {
      // offsetWidth/offsetHeight stay stable while the menu's scale animation is
      // running; getBoundingClientRect() would feed the animated dimensions back
      // into the anchor calculation and make the panel drift.
      const menuRect = { width: panel.offsetWidth, height: panel.offsetHeight };
      const anchorRect = anchorRef?.current?.getBoundingClientRect();
      let nextPosition: MenuPosition | null = null;

      if (anchorRect) {
        nextPosition = menuPosition(placement, anchorRect, menuRect, gap, gutter);
      } else if (anchorPoint) {
        const pointRect = {
          left: anchorPoint.x,
          right: anchorPoint.x,
          top: anchorPoint.y,
          bottom: anchorPoint.y,
        };
        nextPosition = menuPosition(placement, pointRect, menuRect, gap, gutter);
      }

      if (!nextPosition) return;
      setPosition((current) =>
        current?.left === nextPosition.left && current.top === nextPosition.top
          ? current
          : nextPosition
      );
    };

    updatePosition();

    // 内容异步填充后按最终尺寸准确重算位置。Composer 的 wait / confirm
    // 卡片会通过普通布局让锚点上下移动，不会触发 resize 或 scroll；菜单打开
    // 期间逐帧核对锚点，坐标未变化时保留原 state，避免无效渲染。
    let anchorFrame = 0;
    const trackAnchor = () => {
      updatePosition();
      anchorFrame = requestAnimationFrame(trackAnchor);
    };
    if (anchorRef) anchorFrame = requestAnimationFrame(trackAnchor);

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(panel);

    window.addEventListener("resize", updatePosition);
    // 锚在元素上的菜单跟着锚点走；锚在鼠标落点上的右键菜单只能关掉。
    const handleScroll = anchorRef ? updatePosition : () => onCloseRef.current();
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      if (anchorFrame) cancelAnimationFrame(anchorFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, visible, isClosing, anchorRef, anchorPoint, placement, gap, gutter]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-menu-panel='true']")) return;
      if (anchorRef?.current?.contains(target)) return;
      onClose();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, anchorRef]);

  // See `closeAllMenus()` doc comment: clicks inside an embedded
  // `<webview>` (AppPanel tabs / MiniTool) never reach the document-level
  // pointerdown listener above, so this popover would otherwise stay open
  // forever once a guest page takes focus.
  useEffect(() => {
    if (!open) return;
    return subscribeMenuCloseAll(onClose);
  }, [open, onClose]);

  if (!visible) return null;

  return createPortal(
    <MenuPanel
      ref={panelRef}
      closing={isClosing}
      className={className}
      style={{ ...style, ...menuPanelStyle(position) }}
    >
      {children}
    </MenuPanel>,
    document.body
  );
}

export function MenuSubmenu({
  open,
  triggerRef,
  children,
  className,
  side = "right",
  verticalAlign = "center",
  gap = 0,
  gutter = 18,
  positioningMinHeight = 0,
  onMouseEnter,
  onMouseLeave,
}: MenuSubmenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const menuRegisteredRef = useRef(false);

  useEffect(() => {
    return () => {
      if (menuRegisteredRef.current) {
        menuStateClose();
        menuRegisteredRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (open) {
      if (!menuRegisteredRef.current) {
        menuStateOpen();
        menuRegisteredRef.current = true;
      }
      setIsClosing(false);
      setVisible(true);
    } else if (visible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
        setVisible(false);
        setPosition(null);
        if (menuRegisteredRef.current) {
          menuStateClose();
          menuRegisteredRef.current = false;
        }
      }, MENU_OUT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!visible || isClosing) {
      if (!visible) setPosition(null);
      return;
    }

    const updatePosition = () => {
      const panel = panelRef.current;
      const trigger = triggerRef.current;
      if (!panel || !trigger) return;

      const menuRect = panel.getBoundingClientRect();
      const positioningHeight = Math.max(menuRect.height, positioningMinHeight);
      const triggerRect = trigger.getBoundingClientRect();
      const rightLeft = triggerRect.right + gap;
      const leftLeft = triggerRect.left - menuRect.width - gap;
      const hasRightSpace = rightLeft + menuRect.width <= window.innerWidth - gutter;
      const hasLeftSpace = leftLeft >= gutter;
      const preferredLeft =
        side === "left"
          ? (hasLeftSpace || !hasRightSpace ? leftLeft : rightLeft)
          : (hasRightSpace || !hasLeftSpace ? rightLeft : leftLeft);

      // 普通二级菜单以触发项中心对齐；较高的账号菜单改为顶边对齐，
      // 避免菜单高度增加时被向上推离账号卡片。
      const triggerCenterY = triggerRect.top + triggerRect.height / 1.8;
      const centeredTop = triggerCenterY - menuRect.height / 1.8;
      const preferredTop = verticalAlign === "top" ? triggerRect.top : centeredTop;

      setPosition({
        left: clampPosition(preferredLeft, gutter, window.innerWidth - menuRect.width - gutter),
        top: clampPosition(preferredTop, gutter, window.innerHeight - positioningHeight - gutter),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    // 二级菜单内容可能异步变化，父菜单也可能因动态文案改变宽度。
    // 同时观察面板和触发项，确保任一尺寸或位置变化后都重新贴紧触发项。
    const ro = new ResizeObserver(() => updatePosition());
    if (panelRef.current) ro.observe(panelRef.current);
    if (triggerRef.current) ro.observe(triggerRef.current);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      ro.disconnect();
    };
  }, [visible, isClosing, triggerRef, side, gap, gutter, positioningMinHeight]);

  if (!visible) return null;

  return createPortal(
    <MenuPanel
      ref={panelRef}
      closing={isClosing}
      className={className}
      data-menu-submenu="true"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={menuPanelStyle(position)}
    >
      {children}
    </MenuPanel>,
    document.body
  );
}
