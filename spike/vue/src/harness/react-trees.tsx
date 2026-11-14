import type { ComponentType, ReactNode } from "react";
import { useRef, useState } from "react";
import { Star } from "lucide-react";

/**
 * React trees for every scenario. The components are INJECTED so the very same
 * scenario definitions can render either the current library or the pre-refactor
 * copy (git worktree at .baseline/<sha>) — that is how "React rendered the same
 * before and after the class-string extraction" gets proven instead of asserted.
 *
 * Nothing here may import from the vue side.
 */
export interface ReactComponents {
  Button: ComponentType<any>;
  Tooltip: ComponentType<any>;
  HoverCard: ComponentType<any>;
  MenuSubmenu: ComponentType<any>;
  ConfirmDialog: ComponentType<any>;
  Input: ComponentType<any>;
  ToggleSwitch: ComponentType<any>;
  ModalShell: ComponentType<any>;
  MenuItem: ComponentType<any>;
  MenuPopover: ComponentType<any>;
  MenuSeparator: ComponentType<any>;
}

const PANEL_BODY = <p className="m-0 px-5 pt-4 pb-5 text-[14px] text-txt">Modal body copy.</p>;

export function createReactTrees(c: ReactComponents): Record<string, () => ReactNode> {
  const { Button, Input, ToggleSwitch, ModalShell, MenuItem, MenuPopover, MenuSeparator, Tooltip, HoverCard, MenuSubmenu, ConfirmDialog } = c;

function MenuContents() {
  return (
    <>
      <MenuItem icon={<Star size={14} />}>重命名</MenuItem>
      <MenuItem active>复制</MenuItem>
      <MenuItem danger>删除</MenuItem>
      <MenuSeparator />
      <MenuItem trailing={<span className="text-[12px] text-txt-tertiary">⌘K</span>}>偏好设置</MenuItem>
    </>
  );
}

function MenuScenario({
  placement,
  point,
  nested,
  atBottom,
}: {
  placement?: "bottom-start" | "top-start" | "right-start";
  point?: { x: number; y: number };
  nested?: boolean;
  atBottom?: boolean;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(true);

  const anchor = (
    <button
      id="anchor"
      ref={anchorRef}
      type="button"
      onClick={() => setOpen((value) => !value)}
      className="h-[28px] rounded-[var(--ui-radius-sm)] border border-border-subtle bg-sf-elevated px-3 text-[13px] text-txt"
    >
      测试菜单
    </button>
  );

  return (
    <div className="flex flex-col gap-3 p-6" style={{ minHeight: "100%" }}>
      <div className="text-[13px] text-txt-secondary">Menu</div>
      {nested ? (
        <div
          id="scroller"
          className="rounded-md border border-border-subtle"
          style={{ height: 120, overflow: "auto", padding: 8 }}
        >
          <div style={{ height: 40 }} />
          {anchor}
          <div style={{ height: 500 }} />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: atBottom ? "flex-end" : "flex-start",
            minHeight: atBottom ? "calc(100vh - 150px)" : undefined,
          }}
        >
          {anchor}
        </div>
      )}
      <MenuPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={point ? undefined : anchorRef}
        anchorPoint={point ?? null}
        placement={placement ?? "bottom-start"}
      >
        <MenuContents />
      </MenuPopover>
      <p className="m-0 max-w-[420px] text-[12px] text-txt-tertiary">
        菜单挂载到 document.body，定位为 fixed，越过 scroller 的 overflow 裁切。
      </p>
    </div>
  );
}

function ModalScenario({
  mode,
  closeOnBackdrop,
}: {
  mode: "default" | "noHeader" | "headerRight";
  closeOnBackdrop?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-6 text-[13px] text-txt-secondary">
      <div>ModalShell</div>
      <button type="button" onClick={() => setOpen(true)} className="mt-2 underline">
        重新打开
      </button>
      <ModalShell
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "noHeader" ? "无表头" : "设置"}
        closeLabel="关闭"
        noHeader={mode === "noHeader"}
        closeOnBackdrop={closeOnBackdrop}
        headerRight={mode === "headerRight" ? <span className="text-[12px] text-txt-tertiary">自定义</span> : undefined}
        shellClassName={mode === "noHeader" ? "spike-modal spike-modal--narrow" : "spike-modal"}
      >
        {PANEL_BODY}
      </ModalShell>
    </div>
  );
}

function NestedModalScenario() {
  const [outer, setOuter] = useState(true);
  const [inner, setInner] = useState(true);
  return (
    <div className="p-6 text-[13px] text-txt-secondary">
      <div>嵌套 Modal</div>
      <ModalShell open={outer} onClose={() => setOuter(false)} title="外层" closeLabel="关闭" zIndex={200} shellClassName="spike-modal">
        {PANEL_BODY}
      </ModalShell>
      <ModalShell open={inner} onClose={() => setInner(false)} title="内层" closeLabel="关闭" zIndex={201} shellClassName="spike-modal spike-modal--narrow">
        {PANEL_BODY}
      </ModalShell>
    </div>
  );
}


function HoverDrivenTooltip() {
  const [nonce, setNonce] = useState(0);
  return (
    <div className="p-6" data-nonce={nonce}>
      <button type="button" id="tip-trigger" onClick={() => setNonce(nonce + 1)} className="h-[28px] rounded-[var(--ui-radius-sm)] border border-border-subtle px-3 text-[13px]">
        悬停出提示
      </button>
      <Tooltip content="悬停提示" placement="top">
        <span id="tip-anchor" className="ml-2 text-[13px] text-txt-secondary">hover target</span>
      </Tooltip>
    </div>
  );
}

function SubmenuScenario({ side }: { side: "left" | "right" }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="p-6">
      <button id="submenu-trigger" ref={triggerRef} type="button" className="h-[28px] rounded-[var(--ui-radius-sm)] border border-border-subtle px-3 text-[13px]">
        二级菜单触发
      </button>
      <MenuSubmenu open triggerRef={triggerRef} side={side}>
        <MenuItem>二级项一</MenuItem>
        <MenuItem>二级项二</MenuItem>
      </MenuSubmenu>
    </div>
  );
}

function ConfirmScenario() {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-6">
      <button type="button" onClick={() => setOpen(true)} className="underline text-[13px]">重新打开</button>
      <ConfirmDialog
        open={open}
        title="确认删除？"
        description="删除后不可恢复。"
        confirmLabel="确认删除"
        cancelLabel="取消"
        closeLabel="关闭"
        variant="danger"
        showCloseButton
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

const trees: Record<string, () => ReactNode> = {
  "btn-primary": () => <Button variant="primary">主要</Button>,
  "btn-brand": () => <Button variant="brand">品牌</Button>,
  "btn-secondary": () => <Button variant="secondary">次要</Button>,
  "btn-ghost": () => <Button variant="ghost">幽灵</Button>,
  "btn-outline": () => <Button variant="outline">描边</Button>,
  "btn-danger": () => <Button variant="danger">删除</Button>,
  "btn-link": () => <Button variant="link">链接</Button>,
  "btn-secondary-sm": () => <Button variant="secondary" size="sm">小号</Button>,
  "btn-secondary-lg": () => <Button variant="secondary" size="lg">大号</Button>,
  "btn-round-md": () => <Button variant="secondary" round="md">中圆角</Button>,
  "btn-round-full": () => <Button variant="secondary" round="full">全圆角</Button>,
  "btn-icon-ghost": () => <Button icon={<Star size={16} />} aria-label="收藏" />,
  "btn-icon-primary": () => <Button variant="primary" icon={<Star size={16} />} aria-label="收藏" />,
  "btn-icon-danger": () => <Button variant="danger" icon={<Star size={16} />} aria-label="删除" />,
  "btn-pressed": () => <Button variant="ghost" pressed aria-label="固定">已按下</Button>,
  "btn-disabled": () => <Button variant="primary" disabled>禁用</Button>,
  "btn-span": () => (
    <Button as="span" variant="secondary" disabled>
      内联按钮
    </Button>
  ),
  "btn-with-icons": () => (
    <Button variant="secondary" leadingIcon={<Star size={14} />} trailingIcon={<Star size={14} />}>
      带图标
    </Button>
  ),

  "input-default": () => <Input label="名称" hint="显示在列表里" placeholder="输入名称" defaultValue="Finch" />,
  "input-error": () => <Input label="名称" error="必填" defaultValue="" placeholder="输入名称" />,
  "input-ghost": () => <Input variant="ghost" placeholder="幽灵输入" defaultValue="ghost" />,
  "input-plain": () => <Input variant="plain" placeholder="无边框" defaultValue="plain" />,
  "input-mono-sm": () => <Input mono size="sm" defaultValue="npm i @finchtoys/ui" />,
  "input-lg": () => <Input size="lg" round="lg" label="大号" defaultValue="large" />,
  "input-adornment": () => (
    <Input
      label="搜索"
      defaultValue="finch"
      endAdornment={<span className="text-[12px] text-txt-tertiary">⌘K</span>}
    />
  ),

  "toggle-off": () => <ToggleSwitch checked={false} onChange={() => {}} />,
  "toggle-on": () => <ToggleSwitch checked onChange={() => {}} />,
  "toggle-sm-on": () => <ToggleSwitch size="sm" checked onChange={() => {}} />,
  "toggle-disabled": () => <ToggleSwitch checked disabled onChange={() => {}} />,

  "modal-default": () => <ModalScenario mode="default" />,
  "modal-noheader": () => <ModalScenario mode="noHeader" />,
  "modal-header-right": () => <ModalScenario mode="headerRight" />,
  "modal-close-on-backdrop": () => <ModalScenario mode="default" closeOnBackdrop />,
  "modal-nested": () => <NestedModalScenario />,

  "menu-bottom-start": () => <MenuScenario nested />,
  "menu-top-flip": () => <MenuScenario atBottom />,
  "menu-right-start": () => <MenuScenario placement="right-start" />,
  "menu-anchor-point": () => <MenuScenario nested point={{ x: 260, y: 260 }} />,

  // ── Overlays (stage 2) ───────────────────────────────────────────────────
  "tooltip-controlled": () => (
    <div className="p-6">
      <Tooltip content="提示内容" open anchorRect={new DOMRect(200, 160, 96, 28)} placement="bottom">
        <span>anchor</span>
      </Tooltip>
    </div>
  ),
  "tooltip-hover": () => <HoverDrivenTooltip />,
  "hovercard-controlled": () => (
    <div className="p-6">
      <HoverCard content={<span>浮卡内容浮卡内容</span>} open placement="bottom">
        <button type="button" id="hc-trigger" className="h-[28px] rounded-[var(--ui-radius-sm)] border border-border-subtle px-3 text-[13px]">
          hover 我
        </button>
      </HoverCard>
    </div>
  ),
  "menusubmenu-right": () => <SubmenuScenario side="right" />,
  "confirm-open": () => <ConfirmScenario />,

  // ── Sensitivity controls (must be DETECTED as drifted) ───────────────────
  "control-tooltip-offset": () => (
    <div className="p-6">
      <Tooltip content="提示内容" open anchorRect={new DOMRect(200, 160, 96, 28)} placement="bottom">
        <span>anchor</span>
      </Tooltip>
    </div>
  ),
};

  return trees;
}
