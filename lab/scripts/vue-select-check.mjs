import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = fileURLToPath(new URL(".", import.meta.url));
const dist = resolve(here, "../dist");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = join(process.env.HOME ?? "", "Library/Caches/ms-playwright");
  for (const d of ["chromium-1248", "chromium-1217", "chromium-1208"]) {
    const c = join(base, d, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
    if (existsSync(c)) return c;
  }
  return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
}
async function serve() {
  const server = createServer(async (req, res) => {
    try {
      let p = new URL(req.url ?? "/", "http://x").pathname;
      if (p === "/") p = "/panel/index.html";
      if (p === "/favicon.ico") { res.writeHead(204).end(); return; }
      const body = await readFile(join(dist, decodeURIComponent(p)));
      res.writeHead(200, { "content-type": MIME[extname(p)] ?? "application/octet-stream" });
      res.end(body);
    } catch { res.writeHead(404).end("nf"); }
  });
  await new Promise((d) => server.listen(0, "127.0.0.1", d));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
}

const results = [];
const ok = (n, p, d = "") => { results.push(p); console.log(`${p ? "ok  " : "FAIL"} ${n}${d ? ` — ${d}` : ""}`); };

const { server, url } = await serve();
const browser = await chromium.launch({ executablePath: chromiumPath() });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "load" });
await page.getByRole("radio", { name: "Vue（预览）" }).click();
await page.waitForSelector("#lab-vue .demo__card", { timeout: 15000 });

const card = (name) => page.locator("#lab-vue .demo__card", { has: page.locator(".demo__card-head > span:first-child", { hasText: name }) }).first();
const out = async (c) => (await c.locator(".demo__out").innerText()).trim();

// DropdownSelect：卡片里两个实例，第二个走 portal
for (const [label, idx, want] of [["非 portal", 0, "选项 C"], ["portal", 1, "选项 A"]]) {
  const c = await card("DropdownSelect");
  const before = await out(c);
  const trigger = c.locator("button[aria-expanded]").nth(idx);
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.waitForTimeout(350);
  const opt = page.locator(".menuActionRow:visible", { hasText: want }).first();
  const found = await opt.count();
  if (found) await opt.click();
  await page.waitForTimeout(350);
  const after = await out(c);
  ok(`DropdownSelect ${label} 选择生效`, before !== after && after.toUpperCase().includes(want.slice(-1)), `${before} → ${after}${found ? "" : "（菜单没渲染）"}`);
}

// MultiSelect
{
  const c = await card("MultiSelect");
  const before = await out(c);
  await c.locator("button[aria-expanded], button").first().click();
  await page.waitForTimeout(350);
  const opt = page.locator(".menuActionRow:visible", { hasText: "多选 Y" }).first();
  const found = await opt.count();
  if (found) await opt.click();
  await page.waitForTimeout(350);
  const after = await out(c);
  ok("MultiSelect 勾选生效", before !== after, `${before} → ${after}${found ? "" : "（菜单没渲染）"}`);
}

// InlineSelect
{
  const c = await card("InlineSelect");
  const before = await out(c);
  await c.locator("button").first().click();
  await page.waitForTimeout(350);
  const opt = page.locator(".menuActionRow:visible", { hasText: "舒适" }).first();
  const found = await opt.count();
  if (found) await opt.click();
  await page.waitForTimeout(350);
  const after = await out(c);
  ok("InlineSelect 选择生效", before !== after, `${before} → ${after}${found ? "" : "（菜单没渲染）"}`);
}

// DialogMessage 的行内标记：换行必须真的换行，不能把 \n 当字面量打出来
{
  const c = await card("DialogMessage");
  const lines = await c.locator("p").count();
  const text = await c.innerText();
  ok("DialogMessage 换行与标记生效", lines >= 2 && !text.includes("\\n"), `${lines} 行`);
}

// IconTabBar 的 icon 收组件：裸 LucideIcon 没带 name 会渲染出空 svg
{
  const c = await card("IconTabBar");
  const svgs = await c.locator("svg").count();
  const withPath = await c.locator("svg:has(path)").count();
  ok("IconTabBar 图标有实际图形", svgs > 0 && svgs === withPath, `${withPath}/${svgs} 含 path`);
}

console.log("运行时错误:", errors.length ? errors.slice(0, 3).join(" | ") : "无");
const failed = results.filter((r) => !r).length;
console.log(failed === 0 ? "\nVUE SELECT PASS" : `\nVUE SELECT FAIL: ${failed}/${results.length}`);
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
