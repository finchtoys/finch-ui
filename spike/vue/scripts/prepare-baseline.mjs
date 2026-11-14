/**
 * Materialises the pre-refactor copy of the library that the harness renders
 * next to HEAD (`.baseline/<sha>/library`).
 *
 * A git worktree (not a copy) so the baseline is exactly what shipped before
 * the class-string extraction, with no chance of hand-edits drifting.
 *
 *   node scripts/prepare-baseline.mjs [sha]
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../../..");
const sha = process.argv[2] ?? process.env.SPIKE_BASELINE_SHA ?? "568d782";
const target = resolve(repo, ".baseline", sha);

function git(args) {
  return execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
}

if (existsSync(resolve(target, "library/components/Button.tsx"))) {
  console.log(`baseline ready: ${target}`);
  process.exit(0);
}

try {
  git(["worktree", "add", target, sha]);
  console.log(`created baseline worktree: ${target} @ ${sha}`);
} catch (error) {
  console.error(
    `Could not create the baseline worktree at ${target}.\n` +
      `Re-run manually: git worktree add ${target} ${sha}\n` +
      String(error?.message ?? error),
  );
  process.exit(1);
}
