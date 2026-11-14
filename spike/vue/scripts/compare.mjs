/**
 * Node-side runner.
 *
 *  1. serves the built harness (dist/) over http so module imports behave like
 *     the real thing,
 *  2. loads it in headless Chromium at a fixed viewport,
 *  3. runs the in-page comparator (React vs Vue, computed style + behavior),
 *  4. drives REAL mouse/keyboard for hover / focus / click / Esc probes,
 *  5. screenshots both sides of every scenario and byte-compares the PNGs.
 *
 * Output: report/comparison.json + report/shots/*.
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(here, "..");
const dist = join(root, "dist");
const reportDir = join(root, "report");
const shotsDir = join(reportDir, "shots");

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const candidates = [
    join(process.env.HOME ?? "", "Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
    join(process.env.HOME ?? "", "Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error("No Chromium found; set CHROMIUM_PATH");
  return found;
}

async function serve() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      let path = decodeURIComponent(url.pathname);
      if (path === "/") path = "/index.html";
      if (path === "/favicon.ico") {
        res.writeHead(204).end();
        return;
      }
      const file = join(dist, path);
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const { port } = server.address();
  return { server, url: `http://127.0.0.1:${port}/` };
}

const VIEWPORT = { width: 900, height: 700 };

async function settle(page) {
  await page.evaluate(async () => {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 260));
  });
}

/** Real-input probes: mouse hover / focus / click / keyboard, per framework. */
async function runInputProbes(page) {
  const read = (selector, props) =>
    page.evaluate(
      ([sel, list]) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const out = {};
        for (const prop of list) out[prop] = cs.getPropertyValue(prop);
        return out;
      },
      [selector, props],
    );

  const results = {};

  for (const side of ["react", "vue"]) {
    const probe = {};
    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "btn-secondary"), [side]);
    await settle(page);
    const box = await page.locator("#stage button").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(220);
    probe["button.hover"] = await read("#stage button", ["background-color", "color", "filter", "transform"]);

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "btn-primary"), [side]);
    await settle(page);
    const primaryBox = await page.locator("#stage button").boundingBox();
    await page.mouse.move(primaryBox.x + primaryBox.width / 2, primaryBox.y + primaryBox.height / 2);
    await page.waitForTimeout(220);
    probe["button.primary.hover"] = await read("#stage button", ["background-color", "filter"]);

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "input-default"), [side]);
    await settle(page);
    await page.locator("#stage input").click();
    await page.waitForTimeout(220);
    probe["input.focus"] = await read("#stage input", [
      "border-top-color",
      "box-shadow",
      "background-color",
      "outline-style",
    ]);

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "toggle-off"), [side]);
    await settle(page);
    await page.locator("#stage button").click();
    await page.waitForTimeout(320);
    probe["toggle.click"] = await page.evaluate(() => {
      const button = document.querySelector("#stage button");
      const thumb = document.querySelector("#stage button > span");
      return {
        ariaChecked: button?.getAttribute("aria-checked") ?? null,
        trackBg: button ? getComputedStyle(button).backgroundColor : null,
        thumbLeft: thumb ? getComputedStyle(thumb).left : null,
      };
    });

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "modal-nested"), [side]);
    await settle(page);
    const beforeEsc = await page.evaluate(() => document.querySelectorAll("[data-finch-modal-shell]").length);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(140);
    const afterOne = await page.evaluate(() => document.querySelectorAll("[data-finch-modal-shell]").length);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(140);
    probe["modal.esc"] = {
      before: beforeEsc,
      afterOne,
      afterTwo: await page.evaluate(() => document.querySelectorAll("[data-finch-modal-shell]").length),
    };

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "menu-bottom-start"), [side]);
    await settle(page);
    await page.mouse.move(12, VIEWPORT.height - 12);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(200);
    probe["menu.outsideClick"] = await page.evaluate(() => document.querySelectorAll("body > [data-menu-panel]").length);

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "menu-bottom-start"), [side]);
    await settle(page);
    const scroller = await page.locator("#scroller").boundingBox();
    await page.mouse.move(scroller.x + scroller.width / 2, scroller.y + scroller.height / 2);
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(260);
    probe["menu.realScroll"] = await page.evaluate(() => {
      const panel = document.querySelector("body > [data-menu-panel]");
      const anchor = document.querySelector("#anchor");
      if (!panel || !anchor) return { panelPresent: false };
      return {
        panelPresent: true,
        relativeY: Math.round((panel.getBoundingClientRect().y - anchor.getBoundingClientRect().y) * 100) / 100,
      };
    });

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "menu-anchor-point"), [side]);
    await settle(page);
    const scroller2 = await page.locator("#scroller").boundingBox();
    await page.mouse.move(scroller2.x + scroller2.width / 2, scroller2.y + scroller2.height / 2);
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(260);
    probe["menu.anchorPointScrollCloses"] = await page.evaluate(
      () => document.querySelectorAll("body > [data-menu-panel]").length,
    );


    // ── Real pointer / keyboard for the overlay family (stage 2) ────────────
    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "tooltip-hover"), [side]);
    await settle(page);
    await page.locator("#tip-anchor").hover();
    await page.waitForTimeout(520);
    const tipOpened = await page.evaluate(() => document.querySelectorAll("body > .tooltip").length);
    const tipBox = await page.evaluate(() => {
      const tip = document.querySelector("body > .tooltip");
      const anchor = document.querySelector("#tip-anchor");
      if (!tip || !anchor) return null;
      const t = tip.getBoundingClientRect();
      const a = anchor.getBoundingClientRect();
      return { above: t.bottom <= a.top + 1, x: Math.round(t.x), y: Math.round(t.y) };
    });
    await page.mouse.wheel(0, 30);
    await page.waitForTimeout(320);
    const tipAfterScroll = await page.evaluate(() => document.querySelectorAll("body > .tooltip").length);
    probe["tooltip.realHover"] = { opened: tipOpened, placement: tipBox, remainingAfterWheel: tipAfterScroll };

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "hovercard-controlled"), [side]);
    await settle(page);
    probe["hovercard.controlled"] = await page.evaluate(() => {
      const card = document.querySelector("body > .hoverCard");
      const trigger = document.querySelector("#hc-trigger");
      if (!card || !trigger) return { cardPresent: false };
      const c = card.getBoundingClientRect();
      const t = trigger.getBoundingClientRect();
      return { cardPresent: true, below: Math.round(c.top), centeredDelta: Math.round(c.left + c.width / 2 - (t.left + t.width / 2)) };
    });

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "menusubmenu-right"), [side]);
    await settle(page);
    probe["menusubmenu.geometry"] = await page.evaluate(() => {
      const panel = document.querySelector("body > [data-menu-submenu='true']");
      const trigger = document.querySelector("#submenu-trigger");
      if (!panel || !trigger) return { panelPresent: false };
      const p = panel.getBoundingClientRect();
      const t = trigger.getBoundingClientRect();
      return { panelPresent: true, opensRight: p.left >= t.right - 1, x: Math.round(p.x), y: Math.round(p.y) };
    });

    await page.evaluate(([s]) => window.__finchVueSpike.mountForProbe(s, "confirm-open"), [side]);
    await settle(page);
    const confirmBefore = await page.evaluate(() => document.querySelectorAll("[data-finch-modal-shell]").length);
    // Real click on the backdrop: ConfirmDialog must NOT close on it.
    const backdrop = await page.locator("[data-finch-modal-shell]").first().boundingBox();
    await page.mouse.click(backdrop.x + 12, backdrop.y + 12);
    await page.waitForTimeout(200);
    const confirmAfterBackdrop = await page.evaluate(() => document.querySelectorAll("[data-finch-modal-shell]").length);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(220);
    probe["confirm.realInput"] = {
      before: confirmBefore,
      afterBackdropClick: confirmAfterBackdrop,
      afterEscape: await page.evaluate(() => document.querySelectorAll("[data-finch-modal-shell]").length),
    };

    await page.evaluate(() => window.__finchVueSpike.unmountProbe());
    results[side] = probe;
  }
  return results;
}

function compareProbes(react, vue) {
  const diffs = [];
  for (const key of Object.keys(react)) {
    if (JSON.stringify(react[key]) !== JSON.stringify(vue[key])) {
      diffs.push({ key, react: react[key], vue: vue[key] });
    }
  }
  return diffs;
}

/**
 * Screenshots both sides of a scenario and byte-compares the PNGs. A pair that
 * matches is only meaningful if both frames actually drew something, so the
 * element count and PNG size are recorded next to the hash.
 */
async function screenshotPairs(page, scenarios, theme) {
  const diffs = [];
  const themeShots = join(shotsDir, theme);
  await mkdir(themeShots, { recursive: true });
  for (const scenario of scenarios) {
    // Interaction-only scenarios reuse another tree; screenshot it once.
    if (scenario.treeId) continue;
    const buffers = {};
    const nodes = {};
    for (const side of ["react", "vue", "baseline"]) {
      await page.evaluate(([s, id]) => window.__finchVueSpike.mountForProbe(s, id), [side, scenario.id]);
      await page.waitForTimeout(scenario.settle ?? 320);
      nodes[side] = await page.evaluate(() => document.querySelectorAll("#stage *").length);
      buffers[side] = await page.screenshot({ animations: "disabled" });
      await page.evaluate(() => window.__finchVueSpike.unmountProbe());
    }
    const same = buffers.react.equals(buffers.vue);
    const refactorSame = buffers.react.equals(buffers.baseline);
    await writeFile(join(themeShots, `${scenario.id}--react.png`), buffers.react);
    await writeFile(join(themeShots, `${scenario.id}--vue.png`), buffers.vue);
    await writeFile(join(themeShots, `${scenario.id}--baseline.png`), buffers.baseline);
    diffs.push({
      id: scenario.id,
      pixelIdentical: same,
      refactorPixelIdentical: refactorSame,
      nodes,
      bytes: { react: buffers.react.length, vue: buffers.vue.length },
      sha256: {
        react: createHash("sha256").update(buffers.react).digest("hex").slice(0, 16),
        vue: createHash("sha256").update(buffers.vue).digest("hex").slice(0, 16),
        baseline: createHash("sha256").update(buffers.baseline).digest("hex").slice(0, 16),
      },
    });
  }
  return diffs;
}

async function main() {
  const theme = process.argv.includes("--dark") ? "dark" : "light";
  await mkdir(shotsDir, { recursive: true });

  const { server, url } = await serve();
  const browser = await chromium.launch({
    executablePath: chromiumPath(),
    args: ["--font-render-hinting=none", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => document.body.dataset.harnessReady === "true");

  const report = await page.evaluate(([t]) => window.__finchVueSpike.runAll({ theme: t }), [theme]);
  const meta = await page.evaluate(() => window.__finchVueSpike.scenarios);

  const probes = await runInputProbes(page);
  const probeDiffs = compareProbes(probes.react, probes.vue);
  const pixel = await screenshotPairs(page, meta, theme);

  const summary = {
    scenarios: report.scenarios.length,
    // Drift controls: every one of these MUST be detected, otherwise the
    // harness is blind and the zero-drift verdict below means nothing.
    sensitivityPassed: report.sensitivity.every((item) => item.detected),
    sensitivity: report.sensitivity.map((item) => ({
      id: item.id,
      detected: item.detected,
      diffKinds: [...new Set(item.diffs.map((diff) => diff.kind))],
    })),
    scenariosWithDiffs: report.scenarios.filter((item) => item.diffs.length > 0).length,
    totalDiffs: report.scenarios.reduce((sum, item) => sum + item.diffs.length, 0),
    refactorIdentical: report.refactorIdentical,
    refactorSemanticallyIdentical: report.refactorSemanticallyIdentical,
    refactorDiffs: report.scenarios.reduce((sum, item) => sum + item.refactorDiffs.length, 0),
    refactorDiffsByKind: report.scenarios
      .flatMap((item) => item.refactorDiffs)
      .reduce((acc, diff) => ({ ...acc, [diff.kind]: (acc[diff.kind] ?? 0) + 1 }), {}),
    refactorDiffScenarios: report.scenarios.filter((item) => item.refactorDiffs.length > 0).map((item) => item.id),
    refactorPixelDiffScenarios: pixel.filter((item) => !item.refactorPixelIdentical).map((item) => item.id),
    controlDetected: report.control.expectedStyleDiff,
    probeDiffs: probeDiffs.length,
    pixelDiffScenarios: pixel.filter((item) => !item.pixelIdentical).map((item) => item.id),
    blankScreens: pixel.filter((item) => item.nodes.react === 0 || item.nodes.vue === 0).map((item) => item.id),
    minScreenshotBytes: Math.min(...pixel.flatMap((item) => [item.bytes.react, item.bytes.vue])),
    consoleErrors: consoleErrors.filter((text) => !text.includes("favicon")),
  };

  await writeFile(
    join(reportDir, `comparison-${theme}.json`),
    JSON.stringify({ summary, report, probes, probeDiffs, pixel }, null, 2),
  );

  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
  server.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
