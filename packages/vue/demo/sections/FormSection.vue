<script setup lang="ts">
/** Form-tier components with live state. */
import { ref } from "vue";
import {
  Button,
  ButtonGroup,
  CheckBox,
  Input,
  SearchField,
  SecretInput,
  SegmentedControl,
  StepSlider,
  TextArea,
  ToggleSwitch,
} from "@finch-ui-vue";
import LucideIcon from "../../src/icons/LucideIcon.vue";

const clicks = ref(0);
const name = ref("Finch");
const note = ref("多行文本，默认不出现拖拽手柄");
const secret = ref("sk-demo-123");
const agreed = ref(true);
const toggleOn = ref(true);
const mode = ref("daily");
const step = ref("b");
const query = ref("");
const inputError = ref("");
</script>

<template>
  <section class="demo__section">
    <h2 class="demo__section-title">表单</h2>
    <div class="demo__grid">
      <div class="demo__card">
        <div class="demo__card-head"><span>Button</span><span class="demo__out" data-demo="clicks">{{ clicks }} 次</span></div>
        <div class="demo__row">
          <Button variant="primary" @click="clicks++">主要</Button>
          <Button variant="secondary" @click="clicks++">次要</Button>
          <Button variant="ghost" @click="clicks++">幽灵</Button>
          <Button variant="outline" @click="clicks++">描边</Button>
          <Button variant="danger" @click="clicks++">删除</Button>
          <Button variant="link" @click="clicks++">链接</Button>
        </div>
        <div class="demo__row">
          <Button icon aria-label="图标按钮" @click="clicks++"><template #icon><LucideIcon name="search" :size="16" /></template></Button>
          <Button variant="secondary" :pressed="clicks % 2 === 1" @click="clicks++">pressed</Button>
          <Button variant="primary" disabled>禁用</Button>
        </div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>ButtonGroup</span></div>
        <ButtonGroup>
          <Button @click="clicks++">左</Button>
          <Button @click="clicks++">中</Button>
          <Button @click="clicks++">右</Button>
        </ButtonGroup>
        <div class="demo__hint">组内 Button 自动去掉圆角与分隔线</div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>Input</span><span class="demo__out">{{ name.length }} 字</span></div>
        <Input v-model="name" label="名称" hint="输入会实时反映在这里" placeholder="输入名称" />
        <Input
          :error="name.length > 8 ? '名称太长' : ''"
          label="带校验"
          :model-value="name"
          @update:model-value="name = $event"
        />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>TextArea</span></div>
        <TextArea v-model="note" :rows="3" />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>SecretInput</span><span class="demo__out">点眼睛</span></div>
        <SecretInput v-model="secret" show-password-label="显示密码" hide-password-label="隐藏密码" />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>CheckBox / ToggleSwitch</span></div>
        <CheckBox :active="agreed" @toggle="agreed = !agreed">我已阅读</CheckBox>
        <CheckBox :active="false" round="md" desc="方形指示器">方形样式</CheckBox>
        <div class="demo__row">
          <ToggleSwitch :checked="toggleOn" @change="toggleOn = !toggleOn" />
          <ToggleSwitch size="sm" :checked="!toggleOn" @change="toggleOn = !toggleOn" />
          <span class="demo__out">{{ toggleOn ? "on" : "off" }}</span>
        </div>
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>SegmentedControl</span><span class="demo__out">{{ mode }}</span></div>
        <SegmentedControl
          :options="[{ value: 'daily', label: '日' }, { value: 'weekly', label: '周' }, { value: 'monthly', label: '月' }]"
          :value="mode"
          @change="mode = $event"
        />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>StepSlider</span><span class="demo__out">{{ step }}</span></div>
        <StepSlider
          :steps="['a', 'b', 'c', 'd']"
          :labels="{ a: '低', b: '中', c: '高', d: '极高' }"
          :value="step"
          @change="step = $event"
        />
      </div>

      <div class="demo__card">
        <div class="demo__card-head"><span>SearchField</span><span class="demo__out">{{ query || "空" }}</span></div>
        <SearchField
          :model-value="query"
          shortcut="⌘K"
          placeholder="搜索组件…"
          @update:model-value="query = $event"
          @clear="query = ''"
        />
      </div>
    </div>
  </section>
</template>
