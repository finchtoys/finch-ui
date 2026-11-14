/**
 * Demo gate for @finchtoys/ui-vue.
 *
 * 1. static: every exported component is actually used in the demo sources;
 * 2. browser: the built demo mounts, and the interactive parts really respond
 *    (click / type / hover / Esc / theme switch), in all three themes.
 *
 *   node scripts/demo-check.mjs [--keep]
 */
import { createServer } from "node:http";
import { readFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = fileURLToPath(new URL(".", import.meta.url));
const pkgRoot = resolve(here, "..");
const dist = join(pkgRoot, "demo-dist");
const shots = join(pkgRoot, "demo-shots");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };

function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = join(process.env.HOME ?? "", "Library/Caches/ms-playwright");
  for (const dir of ["chromium-1248", "chromium-1217", "chromium-1208"]) {
    const candidate = join(base, dir, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
    if (existsSync(candidate)) return candidate;
  }
  return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
}

async function serve() {
  const server = createServer(async (req, res) => {
    try {
      let path = new URL(req.url ?? "/", "http://x").pathname;
      if (path === "/") path = "/index.html";
      if (path === "/favicon.ico") {
        res.writeHead(204).end();
        return;
      }
      const body = await readFile(join(dist, decodeURIComponent(path)));
      res.writeHead(200, { "content-type": MIME[extname(path)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("nf");
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
}

/** Every root export must appear in the demo sources (not necessarily 1:1 cards). */
async function staticCoverage() {
  const entry = await readFile(join(pkgRoot, "entry.ts"), "utf8");
  const exported = [...entry.matchAll(/export \{ default as (\w+)/g)].map((match) => match[1]);
  const sectionDir = join(pkgRoot, "demo/sections");
  const files = await readdir(sectionDir);
  let source = "";
  for (const file of files) source += await readFile(join(sectionDir, file), "utf8");
  source += await readFile(join(pkgRoot, "demo/App.vue"), "utf8");
  const missing = exported.filter((name) => !new RegExp(`\\b${name}\\b`).test(source));
  return { total: exported.length, missing };
}

const results = [];
function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "ok   " : "FAIL "} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const coverage = await staticCoverage();
  check(`demo covers all exports (${coverage.total})`, coverage.missing.length === 0, coverage.missing.join(", "));

  if (!existsSync(join(dist, "index.html"))) {
    console.error("demo-dist missing — run `npm run demo:build` first");
    process.exit(1);
  }

  await mkdir(shots, { recursive: true });
  const { server, url } = await serve();
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(url, { waitUntil: "load" });
  await page.waitForSelector(".demo__card");

  const cards = await page.locator(".demo__card").count();
  check("demo mounts", cards > 30, `${cards} cards`);
  check("no runtime errors on load", errors.length === 0, errors[0] ?? "");

  // Button click
  const counter = page.locator('[data-demo="clicks"]');
  const before = await counter.textContent();
  await page.getByRole("button", { name: "主要", exact: true }).click();
  await page.waitForTimeout(120);
  const after = await counter.textContent();
  check("Button clickable", before !== after, `${before} → ${after}`);

  // Input typing (bound to a counter hint)
  const input = page.locator(".demo__card", { hasText: "Input" }).locator("input").first();
  await input.click();
  await input.press("ControlOrMeta+a");
  await page.keyboard.type("Vue 版输入");
  await page.waitForTimeout(120);
  check("Input accepts typing", (await input.inputValue()) === "Vue 版输入", await input.inputValue());

  // ToggleSwitch
  const toggle = page.locator('[role="switch"]').first();
  const beforeToggle = await toggle.getAttribute("aria-checked");
  await toggle.click();
  await page.waitForTimeout(120);
  check("ToggleSwitch toggles", beforeToggle !== (await toggle.getAttribute("aria-checked")));

  // Tooltip on real hover
  await page.getByRole("button", { name: "悬停（below）" }).hover();
  await page.waitForTimeout(500);
  const tooltipVisible = await page.locator(".tooltip").isVisible().catch(() => false);
  check("Tooltip opens on real hover", tooltipVisible);

  // Menu opens and an item is clickable
  await page.getByRole("button", { name: "打开菜单" }).click();
  await page.waitForTimeout(250);
  const menuPanels = await page.locator("body > [data-menu-panel]").count();
  check("MenuPopover portals open", menuPanels > 0);
  await page.getByRole("button", { name: "复制" }).click();
  await page.waitForTimeout(260);
  check("Menu item click closes menu", (await page.locator("body > [data-menu-panel]").count()) === 0);

  // Modal + Esc layering
  await page.getByRole("button", { name: "打开弹窗" }).click();
  await page.waitForTimeout(400);
  check("ModalShell opens", (await page.locator("[data-finch-modal-shell]").count()) === 1);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check("ModalShell closes on Esc", (await page.locator("[data-finch-modal-shell]").count()) === 0);

  // ConfirmDialog opens + cancel
  await page.getByRole("button", { name: "删除…" }).click();
  await page.waitForTimeout(400);
  const alertDialog = await page.locator("[role='alertdialog']").count();
  check("ConfirmDialog opens", alertDialog === 1);
  await page.getByRole("button", { name: "取消" }).click();
  await page.waitForTimeout(300);
  check("ConfirmDialog cancels", (await page.locator("[data-finch-modal-shell]").count()) === 0);

  // Themes
  const themed = {};
  for (const label of ["浅色", "深色", "自定义皮肤"]) {
    await page.getByRole("radio", { name: label, exact: true }).click();
    await page.waitForTimeout(320);
    themed[label] = await page.evaluate(() => {
      const css = getComputedStyle(document.documentElement);
      return {
        mode: document.documentElement.dataset.theme,
        accent: css.getPropertyValue("--finch-accent").trim(),
        resolvedAccent: (() => {
          const probe = document.createElement("span");
          probe.style.color = "var(--ui-accent)";
          document.body.append(probe);
          const value = getComputedStyle(probe).color;
          probe.remove();
          return value;
        })(),
        body: getComputedStyle(document.body).backgroundColor,
      };
    });
    await page.screenshot({ path: join(shots, `${label}.png`), fullPage: false });
  }
  const accents = new Set(Object.values(themed).map((t) => t.resolvedAccent));
  check("theme switch changes resolved accent", accents.size === 3, [...accents].join(" | "));
  check("dark theme applied", themed["深色"].mode === "dark");
  check("custom skin overrides --finch-accent", themed["自定义皮肤"].accent === "#0e9f6e", themed["自定义皮肤"].accent);

  check("no runtime errors during interactions", errors.length === 0, errors[0] ?? "");

  await browser.close();
  server.close();

  const failed = results.filter((r) => !r.pass);
  console.log(
    failed.length === 0
      ? `\nDEMO PASS: ${results.length} checks (screenshots in demo-shots/).`
      : `\nDEMO FAIL: ${failed.length} of ${results.length}.`,
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
