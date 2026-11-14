<script setup lang="ts">
/** Display-tier components: every card has something to click or change. */
import { ref } from "vue";
import {
  Alert,
  Badge,
  Chip,
  DialogMessage,
  Empty,
  FreeModelBadge,
  InlineActionLink,
  Kbd,
  ListRow,
  OptionCard,
  SkeletonBlock,
  SkeletonCatalogCard,
  SkeletonCatalogGrid,
  TypingDots,
  WorkingText,
} from "@finch-ui-vue";
import LucideIcon from "../../src/icons/LucideIcon.vue";

const badgeVariant = ref<"neutral" | "accent" | "warning" | "danger" | "success">("accent");
const chipList = ref(["标签 A", "标签 B"]);
const emptyCompact = ref(false);
const optionSelected = ref(true);
const listRows = ref([
  { key: "a", title: "第一条会话", meta: "12:00" },
  { key: "b", title: "第二条会话", meta: "昨天" },
]);
const activeRow = ref("a");
const alertVariant = ref<"info" | "warning" | "error" | "success">("warning");
const kbdCombo = ref("⌘B");
const linkClicks = ref(0);
const skeletonLoading = ref(true);
</script>

<template>
  <section class="demo__section">
    <h2 class="demo__section-title">展示</h2>
    <div class="demo__grid">
      <div class="demo__card">
        <div class="demo__card-head">
          <span>Badge / FreeModelBadge</span>
          <button type="button" class="demo__hint" @click="badgeVariant = badgeVariant === 'accent' ? 'success' : badgeVariant === 'success' ? 'warning' : 'accent'">切换变体</button>
        </div>
        <div class="demo__row">
          <Badge :variant="badgeVariant">v1.2.3</Badge>
          <Badge variant="neutral" size="md">默认</Badge>
          <FreeModelBadge :is-free="true" />
        </div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>Chip（可移除）</span></div>
        <div class="demo__row">
          <Chip v-for="tag in chipList" :key="tag" @remove="chipList = chipList.filter((item) => item !== tag)">
            {{ tag }}
          </Chip>
          <Chip v-if="!chipList.length" actionable @click="chipList = ['标签 A', '标签 B']">恢复标签</Chip>
        </div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head">
          <span>Kbd</span>
          <button type="button" class="demo__hint" @click="kbdCombo = kbdCombo === '⌘B' ? 'Enter' : '⌘B'">换组合键</button>
        </div>
        <div class="demo__row"><Kbd>{{ kbdCombo }}</Kbd><Kbd>⇧⌘K</Kbd></div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head">
          <span>Empty</span>
          <button type="button" class="demo__hint" @click="emptyCompact = !emptyCompact">compact</button>
        </div>
        <Empty :compact="emptyCompact" title="还没有内容" description="点上面的 compact 切换布局">
          <template #icon><LucideIcon name="info" :size="18" /></template>
        </Empty>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>OptionCard</span><span class="demo__out">click 切换</span></div>
        <div class="demo__stack">
          <OptionCard :selected="optionSelected" @click="optionSelected = !optionSelected">选项一（可点）</OptionCard>
          <OptionCard :active="!optionSelected" @click="optionSelected = !optionSelected">选项二</OptionCard>
        </div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>InlineActionLink</span><span class="demo__out">{{ linkClicks }} 次</span></div>
        <p style="margin: 0; font-size: 13px; color: var(--ui-text-secondary)">
          行内链接用在句子里，
          <InlineActionLink @click="linkClicks++">点我试试</InlineActionLink>
          后面的文字继续。
        </p>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>ListRow</span><span class="demo__out">{{ activeRow }}</span></div>
        <ListRow
          v-for="row in listRows"
          :key="row.key"
          :title="row.title"
          :row-key="row.key"
          clickable
          :is-active="activeRow === row.key"
          :float-visible="activeRow === row.key"
          @click="activeRow = row.key"
        >
          <template #icon><LucideIcon name="info" :size="16" /></template>
          <template #meta><span class="demo__out">{{ row.meta }}</span></template>
          <template #float><Badge variant="accent">操作</Badge></template>
        </ListRow>
      </div>

      <div class="demo__card">
        <div class="demo__card-head">
          <span>Alert</span>
          <button
            type="button"
            class="demo__hint"
            @click="alertVariant = alertVariant === 'warning' ? 'error' : alertVariant === 'error' ? 'success' : alertVariant === 'success' ? 'info' : 'warning'"
          >
            切换类型
          </button>
        </div>
        <Alert :variant="alertVariant" title="提示标题">这是 {{ alertVariant }} 类型的提示正文。</Alert>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>TypingDots / WorkingText</span></div>
        <div class="demo__row">
          <TypingDots /><TypingDots size="small" /><TypingDots size="tiny" />
          <WorkingText active tone="accent">正在处理中</WorkingText>
        </div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head">
          <span>Skeleton</span>
          <button type="button" class="demo__hint" @click="skeletonLoading = !skeletonLoading">
            {{ skeletonLoading ? "显示内容" : "显示骨架" }}
          </button>
        </div>
        <SkeletonCatalogGrid v-if="skeletonLoading" :count="3" />
        <template v-else>
          <div class="demo__row"><SkeletonBlock style="height: 12px; width: 120px" /><SkeletonBlock style="height: 12px; width: 60px" /></div>
          <SkeletonCatalogCard :index="2" />
          <div class="demo__hint">SkeletonBlock + SkeletonCatalogCard 单卡</div>
        </template>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>DialogMessage</span></div>
        <DialogMessage message="第一行 {红色文字}\r\n> 灰色说明 `code` 行内" />
      </div>
    </div>
  </section>
</template>
