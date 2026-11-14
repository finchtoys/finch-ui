<script setup lang="ts">
/**
 * Vue port of DialogMessage.tsx.
 *
 * The inline token language (`code` and `{text}\g` suffix spans) and the
 * markdown-ish image line are parsed by the same rules; rendering is a template
 * over the parsed segments.
 */
import { computed } from "vue";
import {
  DIALOG_INLINE_CODE_CLASS,
  DIALOG_INLINE_SUFFIX_CLASS,
  DIALOG_MESSAGE_BLANK_LINE_CLASS,
  DIALOG_MESSAGE_IMAGE_CLASS,
  DIALOG_MESSAGE_IMAGE_ROW_CLASS,
  dialogMessageClassName,
  dialogMessageLineClassName,
} from "@shared/classes";

interface DialogImageLine {
  alt: string;
  src: string;
}

type Segment =
  | { kind: "image"; alt: string; src: string }
  | { kind: "blank" }
  | { kind: "text"; tone: "default" | "muted" | "warning"; tokens: InlineToken[] };

type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "suffix"; text: string; suffix: string };

const props = withDefaults(defineProps<{ message?: string; className?: string }>(), { className: "" });

const MAX_INLINE_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const TOKEN_PATTERN = /(`[^`]+`|\{[^}\n]+\}\\[grymabi])/g;

function isSafeImageSrc(src: string): boolean {
  if (/^data:/i.test(src)) {
    const match = src.match(/^data:([^;,]+)[;,]/i);
    return Boolean(match && ALLOWED_MIME.includes(match[1].toLowerCase()));
  }
  return /^https?:\/\//i.test(src);
}

function parseImageLine(rawLine: string): DialogImageLine | null {
  const line = rawLine.trim();
  if (!line.startsWith("![") || !line.endsWith(")")) return null;
  const separator = line.indexOf("](", 2);
  if (separator < 0) return null;
  const alt = line.slice(2, separator);
  const src = line.slice(separator + 2, -1).trim();
  if (!src || !isSafeImageSrc(src)) return null;
  return { alt, src };
}

/** Tone markers are a leading `> ` (muted) or `! ` (warning), like the React normalizer. */
function normalizeLine(rawLine: string): { tone: "default" | "muted" | "warning"; text: string } {
  const trimmed = rawLine.trim();
  if (trimmed.startsWith("> ")) return { tone: "muted", text: trimmed.slice(2) };
  if (trimmed.startsWith("! ")) return { tone: "warning", text: trimmed.slice(2) };
  return { tone: "default", text: rawLine };
}

function tokenize(text: string): InlineToken[] {
  const parts: InlineToken[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    if (match.index > cursor) parts.push({ kind: "text", text: text.slice(cursor, match.index) });
    const token = match[0];
    if (token.startsWith("`")) {
      parts.push({ kind: "code", text: token.slice(1, -1) });
    } else {
      parts.push({ kind: "suffix", text: token.slice(1, -3), suffix: token.at(-1) ?? "" });
    }
    cursor = match.index + token.length;
  }
  if (cursor < text.length) parts.push({ kind: "text", text: text.slice(cursor) });
  return parts;
}

const segments = computed<Segment[]>(() => {
  if (!props.message) return [];
  return props.message
    .trim()
    .split(/\r?\n/)
    .map((rawLine): Segment => {
      if (!rawLine.trim()) return { kind: "blank" };
      const image = parseImageLine(rawLine);
      if (image) return { kind: "image", alt: image.alt, src: image.src };
      const line = normalizeLine(rawLine);
      return { kind: "text", tone: line.tone, tokens: tokenize(line.text) };
    });
});
</script>

<template>
  <div v-if="props.message" :class="dialogMessageClassName(props.className)">
    <template v-for="(segment, index) in segments" :key="index">
      <div v-if="segment.kind === 'blank'" :class="DIALOG_MESSAGE_BLANK_LINE_CLASS" aria-hidden="true" />
      <div v-else-if="segment.kind === 'image'" :class="DIALOG_MESSAGE_IMAGE_ROW_CLASS">
        <img
          :src="segment.src"
          :alt="segment.alt"
          decoding="async"
          draggable="false"
          referrerpolicy="no-referrer"
          :class="DIALOG_MESSAGE_IMAGE_CLASS"
        />
      </div>
      <p v-else :class="dialogMessageLineClassName(segment.tone)">
        <template v-for="(token, tokenIndex) in segment.tokens" :key="tokenIndex">
          <code v-if="token.kind === 'code'" :class="DIALOG_INLINE_CODE_CLASS">{{ token.text }}</code>
          <span v-else-if="token.kind === 'suffix'" :class="DIALOG_INLINE_SUFFIX_CLASS[token.suffix] ?? ''">{{ token.text }}</span>
          <template v-else>{{ token.text }}</template>
        </template>
      </p>
    </template>
  </div>
</template>
