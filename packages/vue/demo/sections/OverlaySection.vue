<script setup lang="ts">
/** Portal/overlay tier — the part where framework semantics actually diverge. */
import { ref } from "vue";
import {
  Button,
  ConfirmDialog,
  HoverCard,
  MenuItem,
  MenuPopover,
  MenuSubmenu,
  ModalShell,
  Tooltip,
} from "@finch-ui-vue";
import LucideIcon from "../../src/icons/LucideIcon.vue";

const menuOpen = ref(false);
const menuAnchor = ref<{ el?: HTMLElement | null } | null>(null);
const submenuOpen = ref(false);
const submenuTrigger = ref<HTMLElement | null>(null);
const modalOpen = ref(false);
const confirmOpen = ref(false);
const confirmPending = ref(false);
const lastAction = ref("（还没点）");

function confirm() {
  confirmPending.value = true;
  setTimeout(() => {
    confirmPending.value = false;
    confirmOpen.value = false;
    lastAction.value = "已确认";
  }, 700);
}
</script>

<template>
  <section class="demo__section">
    <h2 class="demo__section-title">浮层</h2>
    <div class="demo__grid">
      <div class="demo__card">
        <div class="demo__card-head"><span>Tooltip</span></div>
        <div class="demo__row">
          <Tooltip content="下方提示">
            <Button variant="secondary">悬停（below）</Button>
          </Tooltip>
          <Tooltip content="上方提示" placement="top">
            <Button variant="secondary">上方</Button>
          </Tooltip>
          <Tooltip content="右侧提示" placement="right">
            <Button variant="secondary">右侧</Button>
          </Tooltip>
        </div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>HoverCard</span></div>
        <HoverCard placement="bottom">
          <Button variant="secondary">悬停看浮卡</Button>
          <template #content>
            <div style="max-width: 220px; font-size: 12px; color: var(--ui-text-secondary)">
              浮卡内容可以任意长，靠近视口边缘会自动翻转方向。
            </div>
          </template>
        </HoverCard>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>MenuPopover / MenuItem</span><span class="demo__out">{{ lastAction }}</span></div>
        <Button ref="menuAnchor" variant="secondary" @click="menuOpen = !menuOpen">打开菜单</Button>
        <MenuPopover
          :open="menuOpen"
          :get-anchor="() => (menuAnchor?.el as HTMLElement | null) ?? null"
          placement="bottom-start"
          :gap="6"
          @close="menuOpen = false"
        >
          <MenuItem @click="lastAction = '重命名'; menuOpen = false">
            <template #icon><LucideIcon name="info" :size="14" /></template>
            重命名
          </MenuItem>
          <MenuItem active @click="lastAction = '复制'; menuOpen = false">复制</MenuItem>
          <MenuItem danger @click="lastAction = '删除'; menuOpen = false">删除</MenuItem>
          <MenuItem separator />
          <MenuItem @click="lastAction = '偏好'; menuOpen = false">
            偏好设置
            <template #trailing><span class="demo__out">⌘K</span></template>
          </MenuItem>
        </MenuPopover>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>MenuSubmenu</span></div>
        <div class="demo__row">
          <button
            ref="submenuTrigger"
            type="button"
            class="demo__hint"
            style="padding: 6px 10px; border: 1px solid var(--ui-border-subtle); border-radius: 6px; background: var(--ui-bg-hover); cursor: pointer"
            @mouseenter="submenuOpen = true"
            @mouseleave="submenuOpen = false"
          >
            悬停展开二级菜单
          </button>
        </div>
        <MenuSubmenu
          :open="submenuOpen"
          :get-trigger="() => submenuTrigger"
          side="right"
          @hover-in="submenuOpen = true"
          @hover-out="submenuOpen = false"
        >
          <MenuItem>二级项一</MenuItem>
          <MenuItem>二级项二</MenuItem>
        </MenuSubmenu>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>ModalShell</span></div>
        <div class="demo__row">
          <Button variant="secondary" @click="modalOpen = true">打开弹窗</Button>
        </div>
        <ModalShell
          :open="modalOpen"
          title="弹窗标题"
          close-label="关闭"
          shell-class-name="demo-modal"
          @close="modalOpen = false"
        >
          <div style="padding: 16px 20px 20px; font-size: 13px; color: var(--ui-text-secondary)">
            Esc 只关闭最上层；点遮罩默认不关闭。按 Esc 或点右上角关闭。
          </div>
        </ModalShell>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>ConfirmDialog</span><span class="demo__out">{{ lastAction }}</span></div>
        <Button variant="danger" @click="confirmOpen = true">删除…</Button>
        <ConfirmDialog
          :open="confirmOpen"
          title="确认删除？"
          description="删除后不可恢复。"
          confirm-label="确认删除"
          cancel-label="取消"
          close-label="关闭"
          variant="danger"
          :pending="confirmPending"
          show-close-button
          @confirm="confirm"
          @cancel="confirmOpen = false"
        />
      </div>
    </div>
  </section>
</template>
