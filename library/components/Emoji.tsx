/**
 * Emoji.tsx — 统一 emoji 渲染组件。
 *
 * - Emoji：单个 emoji 序列 → Twemoji SVG 图片；子集外 / 加载失败回退原文本。
 * - EmojiText：一段混合文本 → 按 emoji 分词后混合渲染（图片 + 原文本）。
 *
 * 接入点：StreamdownMarkdown（rehype 插件）、UserMessage、ViewHeader、
 * Start、AppIcon 等所有用户可见文本位置。
 */
import { memo, useMemo, useState } from "react";
import { resolveEmojiAsset, tokenizeEmoji } from "./emoji/twemoji";

export interface EmojiProps {
  /** 单个 emoji 序列，如 "❤️" 或 "👨\u200D⚕️"。 */
  text: string;
  className?: string;
}

/** 单个 emoji：命中子集渲染 SVG，否则渲染原文本（系统 emoji 兜底）。 */
export const Emoji = memo(function Emoji({ text, className }: EmojiProps) {
  const [failed, setFailed] = useState(false);
  const src = useMemo(() => (failed ? undefined : resolveEmojiAsset(text)), [text, failed]);

  if (!src) return <span className={className}>{text}</span>;
  return (
    <img
      src={src}
      alt={text}
      draggable={false}
      className={["twemoji", className].filter(Boolean).join(" ")}
      onError={() => setFailed(true)}
    />
  );
});

export interface EmojiTextProps {
  /** 任意混合文本。 */
  text: string;
  className?: string;
}

/** 混合文本：把其中的 emoji 渲染为 Twemoji 图片，其余文本保持原样。 */
export const EmojiText = memo(function EmojiText({ text, className }: EmojiTextProps) {
  const tokens = useMemo(() => tokenizeEmoji(text), [text]);
  // 纯文本快路径：避免无谓的节点开销。
  if (tokens.length === 1 && tokens[0].type === "text") return <>{text}</>;

  return (
    <>
      {tokens.map((token, index) =>
        token.type === "emoji" ? (
          <Emoji key={index} text={token.value} className={className} />
        ) : (
          token.value
        ),
      )}
    </>
  );
});
