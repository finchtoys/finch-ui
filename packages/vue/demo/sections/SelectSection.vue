<script setup lang="ts">
/** Selectors and navigation: every control opens/picks something. */
import { ref } from "vue";
import {
  Breadcrumb,
  DropdownSelect,
  IconTabBar,
  InlineSelect,
  InputSelect,
  MultiSelect,
  ScrollArea,
  TimePicker,
} from "@finch-ui-vue";
import LucideIcon from "../../src/icons/LucideIcon.vue";

const pick = ref("b");
const multi = ref<string[]>(["x"]);
const inline = ref("compact");
const inputSelect = ref("");
const inputOpen = ref(false);
const hour = ref(9);
const minute = ref(30);
const tab = ref("home");
const crumb = ref("组件库");

const options = [
  { value: "a", label: "选项 A", detail: "A1" },
  { value: "b", label: "选项 B", detail: "B2" },
  { value: "c", label: "选项 C" },
];
const multiOptions = [
  { value: "x", label: "多选 X" },
  { value: "y", label: "多选 Y" },
  { value: "z", label: "多选 Z" },
];
const tabs = [
  { key: "home", label: "首页", icon: LucideIcon, badge: 2 },
  { key: "search", label: "搜索", icon: LucideIcon },
  { key: "bell", label: "提醒", icon: LucideIcon, align: "end" as const },
];
</script>

<template>
  <section class="demo__section">
    <h2 class="demo__section-title">选择器与导航</h2>
    <div class="demo__grid">
      <div class="demo__card">
        <div class="demo__card-head"><span>DropdownSelect</span><span class="demo__out">{{ pick }}</span></div>
        <DropdownSelect v-model:value="pick" :value="pick" label="单选" :options="options" @change="pick = $event" />
        <DropdownSelect :value="pick" :options="options" block portal size="sm" @change="pick = $event" />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>MultiSelect</span><span class="demo__out">{{ multi.join(',') || '空' }}</span></div>
        <MultiSelect v-model="multi" :options="multiOptions" label="多选" placeholder="未选择" />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>InlineSelect</span><span class="demo__out">{{ inline }}</span></div>
        <InlineSelect
          :value="inline"
          :options="[{ value: 'compact', label: '紧凑' }, { value: 'comfortable', label: '舒适' }]"
          @change="inline = $event as string"
        />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>InputSelect</span><span class="demo__out">{{ inputSelect || '未选' }}</span></div>
        <InputSelect
          :model-value="inputSelect"
          label="可输入的触发框"
          hint="点右侧箭头打开选项"
          :open="inputOpen"
          @update:model-value="inputSelect = $event"
          @toggle-open="inputOpen = !inputOpen"
        >
          <div style="position: relative">
            <div
              v-if="inputOpen"
              style="position: absolute; left: 0; right: 0; top: 6px; z-index: 40; padding: 6px; border: 1px solid var(--ui-border-subtle); border-radius: 8px; background: var(--ui-bg-elevated)"
            >
              <button
                v-for="option in options"
                :key="option.value"
                type="button"
                style="display: block; width: 100%; text-align: left; padding: 6px 8px; background: none; border: 0; cursor: pointer; color: var(--ui-text-secondary)"
                @click="inputSelect = option.label; inputOpen = false"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </InputSelect>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>TimePicker</span><span class="demo__out">{{ hour }}:{{ minute }}</span></div>
        <div class="demo__row">
          <TimePicker :hour="hour" :minute="minute" @change="(h, m) => { hour = h; minute = m }" />
          <TimePicker plain :hour="hour" :minute="minute" @change="(h, m) => { hour = h; minute = m }" />
        </div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>IconTabBar</span><span class="demo__out">{{ tab }}</span></div>
        <IconTabBar :tabs="tabs" :active-key="tab" @change="tab = $event" @reselect="tab = $event" />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>Breadcrumb</span><span class="demo__out">{{ crumb }}</span></div>
        <Breadcrumb
          :items="[
            { label: '根', onClick: () => (crumb = '根') },
            { label: '组件库', onClick: () => (crumb = '组件库') },
            { label: '当前页', active: true },
          ]"
          aria-label="演示面包屑"
        />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>ScrollArea</span><span class="demo__out">滚动看渐变</span></div>
        <ScrollArea class="demo__scroll" :max-height="120">
          <p v-for="index in 12" :key="index">第 {{ index }} 行 · 滚动时上下边缘出现渐隐</p>
        </ScrollArea>
      </div>
    </div>
  </section>
</template>
