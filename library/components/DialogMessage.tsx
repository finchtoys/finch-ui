import type { ReactNode } from "react";
import {
  DIALOG_INLINE_CODE_CLASS,
  DIALOG_INLINE_SUFFIX_CLASS,
  DIALOG_MESSAGE_BLANK_LINE_CLASS,
  DIALOG_MESSAGE_IMAGE_CLASS,
  DIALOG_MESSAGE_IMAGE_ROW_CLASS,
  dialogMessageClassName,
  dialogMessageLineClassName,
} from "../styles/classes";

interface DialogMessageProps {
  message?: string;
  className?: string;
}

type LineTone = "default" | "muted" | "warning";

export interface DialogImageLine {
  alt: string;
  src: string;
}

const MAX_INLINE_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_INLINE_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

/**
 * Render the inline token subset (`` `code` `` and `{text}\g/\r/\y/\m/\a/\b/\i`
 * colour/weight/style spans) shared by `ConfirmDialogOptions.message` and the
 * Delivery sidebar row's `detail` text. Exported so non-dialog single-line UI
 * (e.g. `DeliveryRow`) can reuse the exact same formatting language without a
 * full multi-line paragraph/image `DialogMessage` render.
 */
export function renderInlineTokens(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const tokenPattern = /(`[^`]+`|\{[^}\n]+\}\\[grymabi])/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={`${match.index}:code`} className={DIALOG_INLINE_CODE_CLASS}>
          {token.slice(1, -1)}
        </code>,
      );
    } else if (/^\{[^}\n]+\}\\[grymabi]$/.test(token)) {
      const suffix = token.at(-1) ?? "";
      parts.push(
        <span key={`${match.index}:style`} className={DIALOG_INLINE_SUFFIX_CLASS[suffix] ?? ""}>
          {token.slice(1, -3)}
        </span>,
      );
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

/**
 * Plain-text counterpart of `renderInlineTokens` — strips the `` `code` `` /
 * `{text}\g/\r/\y/\m/\a/\b/\i` markup and returns the underlying text only.
 * Use for native tooltips or other non-JSX contexts (e.g. a Delivery row's
 * `title` attribute) where the full `detail` should stay readable even once
 * the single-line row itself truncates it.
 */
export function stripInlineTokens(text: string): string {
  const tokenPattern = /(`([^`]+)`|\{([^}\n]+)\}\\[grymabi])/g;
  return text.replace(tokenPattern, (_match, _full, codeInner, styleInner) => codeInner ?? styleInner ?? "");
}

function normalizeLine(rawLine: string): { text: string; tone: LineTone } {
  const trimmedStart = rawLine.trimStart();
  if (trimmedStart.startsWith(">")) return { text: trimmedStart.slice(1).trimStart(), tone: "muted" };
  if (trimmedStart.startsWith("![")) return { text: rawLine, tone: "default" };
  if (trimmedStart.startsWith("!")) return { text: trimmedStart.slice(1).trimStart(), tone: "warning" };
  return { text: rawLine, tone: "default" };
}

function isSafeDialogImageSrc(src: string): boolean {
  if (/^https:\/\//i.test(src)) {
    try {
      const url = new URL(src);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }

  const dataMatch = /^data:(image\/(?:png|jpeg|webp|gif));base64,([a-z0-9+/]*={0,2})$/i.exec(src);
  if (!dataMatch || !ALLOWED_INLINE_IMAGE_MIME_TYPES.has(dataMatch[1].toLowerCase())) return false;
  const payload = dataMatch[2];
  if (payload.length === 0 || payload.length % 4 !== 0) return false;
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return (payload.length / 4) * 3 - padding <= MAX_INLINE_IMAGE_BYTES;
}

/** Parse one standalone Markdown image line used by Finch dialog messages. */
export function parseDialogImageLine(rawLine: string): DialogImageLine | null {
  const line = rawLine.trim();
  if (!line.startsWith("![") || !line.endsWith(")")) return null;
  const separator = line.indexOf("](", 2);
  if (separator < 0) return null;
  const alt = line.slice(2, separator);
  const src = line.slice(separator + 2, -1).trim();
  if (!src || !isSafeDialogImageSrc(src)) return null;
  return { alt, src };
}

export function DialogMessage({ message, className = "" }: DialogMessageProps) {
  if (!message) return null;
  const lines = message.trim().split(/\r?\n/);

  return (
    <div className={dialogMessageClassName(className)}>
      {lines.map((rawLine, index) => {
        if (!rawLine.trim()) return <div key={index} className={DIALOG_MESSAGE_BLANK_LINE_CLASS} aria-hidden="true" />;
        const image = parseDialogImageLine(rawLine);
        if (image) {
          return (
            <div key={index} className={DIALOG_MESSAGE_IMAGE_ROW_CLASS}>
              <img
                src={image.src}
                alt={image.alt}
                decoding="async"
                draggable={false}
                referrerPolicy="no-referrer"
                className={DIALOG_MESSAGE_IMAGE_CLASS}
              />
            </div>
          );
        }
        const line = normalizeLine(rawLine);
        return (
          <p key={index} className={dialogMessageLineClassName(line.tone)}>
            {renderInlineTokens(line.text)}
          </p>
        );
      })}
    </div>
  );
}
