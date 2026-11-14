/**
 * Headless check for the UI Lab panel's React / Vue switch.
 *
 *   node scripts/panel-check.mjs
 *
 * Serves lab/dist and drives the real page: default React gallery, switch to the
 * Vue preview (lazy chunk), interact with it, switch back and confirm the Vue
 * app is unmounted again.
 */
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = fileURLToPath(new URL(".", import.meta.url));
const dist = resolve(here, "../dist");
const shots = resolve(here, "../dist-panel-shots");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

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
      if (path === "/") path = "/panel/index.html";
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

const results = [];
function check(name, pass, detail = "") {
  results.push({ name, pass });
  console.log(`${pass ? "ok   " : "FAIL "} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  await mkdir(shots, { recursive: true });
  const { server, url } = await serve();
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon")) errors.push(message.text());
  });

  await page.goto(url, { waitUntil: "load" });
  await page.waitForSelector(".lab-header");

  const reactCards = await page.locator("[data-component]").count();
  check("React gallery is the default", reactCards > 20, `${reactCards} cards`);

  await page.getByRole("radio", { name: "Vue（预览）" }).click();
  await page.waitForSelector("#lab-vue .demo__card", { timeout: 15000 });
  const vueCards = await page.locator("#lab-vue .demo__card").count();
  check("Vue preview mounts", vueCards > 25, `${vueCards} cards`);
  check("React gallery hidden while previewing", !(await page.locator("[data-component]").first().isVisible()));

  // Interact with the Vue gallery: click counter, open modal.
  const counter = page.locator("#lab-vue [data-demo='clicks']");
  const before = (await counter.textContent()) ?? "";
  await page.locator("#lab-vue").getByRole("button", { name: "主要", exact: true }).click();
  await page.waitForTimeout(150);
  check("Vue gallery is interactive", (await counter.textContent()) !== before);

  await page.locator("#lab-vue").getByRole("button", { name: "打开弹窗" }).click();
  await page.waitForTimeout(400);
  check("Vue modal opens in the panel", (await page.locator("[data-finch-modal-shell]").count()) === 1);
  await page.screenshot({ path: join(shots, "vue-preview.png") });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // Theme control stays authoritative for both galleries.
  await page.getByRole("radio", { name: "本页深色" }).click();
  await page.waitForTimeout(400);
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check("host theme switch reaches the Vue gallery", dark === "rgb(25, 25, 25)" || dark.startsWith("color("), dark);

  await page.getByRole("radio", { name: "React", exact: true }).click();
  await page.waitForTimeout(400);
  check("switching back shows React again", await page.locator("[data-component]").first().isVisible());
  check("Vue app unmounted on switch back", (await page.locator("#lab-vue .demo__card").count()) === 0);
  await page.screenshot({ path: join(shots, "react.png") });

  check("no runtime errors", errors.length === 0, errors[0] ?? "");

  await browser.close();
  server.close();

  const failed = results.filter((result) => !result.pass);
  console.log(failed.length === 0 ? `\nPANEL PASS: ${results.length} checks.` : `\nPANEL FAIL: ${failed.length} of ${results.length}.`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
