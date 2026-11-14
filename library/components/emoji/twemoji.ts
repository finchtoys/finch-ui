/**
 * twemoji.ts — Twemoji 统一 emoji 渲染的运行时服务。
 *
 * 资源：scripts/build-twemoji-assets.mjs 生成的常用子集
 * （src/renderer/ui/assets/twemoji/*.svg + index.ts 映射），
 * 经 Vite import.meta.glob 打包为独立资源文件。
 *
 * 策略：
 *  - 命中子集的 emoji → 渲染本地 SVG 图片（跨平台完全一致）；
 *  - 未命中（罕见/新增 emoji）→ 返回 undefined，调用方渲染原文本，
 *    由系统字体兜底，视觉与现状一致，无感知降级。
 */
import { parse, toCodePoints } from "@twemoji/parser";
import { EMOJI_ASSET_MAP } from "../assets/twemoji/index";

// eager + ?url：构建时把所有子集 SVG 输出为资源文件并拿到 URL。
// glob 的 key 是源码相对路径（如 ../assets/twemoji/1f600.svg），
// value 是构建后的资源 URL（dev 为 dev-server 路径，prod 为带 hash 的
// 相对路径）。映射必须按「源码文件名」建立，否则会与构建后的
// hash 文件名（1f600-xxxxx.svg）失配。
const assetModules = import.meta.glob("../assets/twemoji/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const urlByBasename = new Map<string, string>();
for (const [key, url] of Object.entries(assetModules)) {
  urlByBasename.set(key.split("/").pop() ?? key, url);
}

/**
 * 解析单个 emoji 序列 → 本地打包的 SVG URL。
 * 未打包（子集外）返回 undefined，调用方回退系统 emoji。
 */
export function resolveEmojiAsset(text: string): string | undefined {
  if (!text) return undefined;
  const key = toCodePoints(text).join("-");
  const file = EMOJI_ASSET_MAP[key];
  if (!file) return undefined;
  return urlByBasename.get(file);
}

export interface EmojiToken {
  type: "text" | "emoji";
  value: string;
}

// 按文本缓存分词结果（消息内容重复率高；上限防止长会话内存膨胀）。
const tokenizeCache = new Map<string, EmojiToken[]>();
const TOKENIZE_CACHE_MAX = 2000;

const VARIATION_SELECTOR_16 = "\uFE0F";

/**
 * 把一段文本按 emoji 序列分割（基于 @twemoji/parser 的 indices，
 * 正确识别 ZWJ / 肤色 / 旗帜 / keycap 等组合序列）。
 * 返回的 token 按序拼接即原文本。
 */
export function tokenizeEmoji(text: string): EmojiToken[] {
  const cached = tokenizeCache.get(text);
  if (cached) return cached;

  const tokens: EmojiToken[] = [];
  const entities = parse(text, { assetType: "svg" });
  let cursor = 0;
  for (const entity of entities) {
    let [start, end] = entity.indices;
    let value = entity.text;
    // @twemoji/parser 对「文本默认呈现」的基字符 + VS16（如 ✌️ = U+270C U+FE0F）
    // 有已知 bug：只把孤立的 VS16 识别成 entity，前面的基字符被当纯文本吐出。
    // 兜底：命中孤立 VS16 且能与前一个字符组成子集内的合法序列时，回退合并成完整 emoji。
    if (value === VARIATION_SELECTOR_16 && start > cursor) {
      const merged = text.slice(start - 1, end);
      if (EMOJI_ASSET_MAP[toCodePoints(merged).join("-")]) {
        start -= 1;
        value = merged;
      }
    }
    if (start > cursor) tokens.push({ type: "text", value: text.slice(cursor, start) });
    tokens.push({ type: "emoji", value });
    cursor = end;
  }
  if (cursor < text.length) tokens.push({ type: "text", value: text.slice(cursor) });

  if (tokenizeCache.size >= TOKENIZE_CACHE_MAX) tokenizeCache.clear();
  tokenizeCache.set(text, tokens);
  return tokens;
}
