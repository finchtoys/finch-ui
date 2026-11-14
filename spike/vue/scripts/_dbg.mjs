import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
const dist = "/Users/puterjam/Workspace/aeolus/finch-ui/spike/vue/dist";
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css"};
const server = createServer(async (req,res)=>{try{let p=new URL(req.url,"http://x").pathname;if(p==="/")p="/index.html";const f=join(dist,decodeURIComponent(p));const body=await readFile(f);res.writeHead(200,{"content-type":MIME[extname(f)]??"application/octet-stream"});res.end(body);}catch(e){res.writeHead(404).end("nf");}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const port=server.address().port;
const browser=await chromium.launch({executablePath:"/Users/puterjam/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"});
const page=await browser.newPage({viewport:{width:900,height:700}});
page.on("console",m=>{if(m.type()==="error")console.log("CONSOLE",m.text())});
page.on("pageerror",e=>console.log("PAGEERROR",String(e)));
await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:"load"});
await page.waitForFunction(()=>document.body.dataset.harnessReady==="true");
for (const id of ["menu-bottom-start","menu-anchor-point"]) {
  for (const side of ["react","vue"]) {
    await page.evaluate(([s,i])=>window.__finchVueSpike.mountForProbe(s,i),[side,id]);
    await page.waitForTimeout(600);
    const info=await page.evaluate(()=>({stage:document.getElementById("stage")?.innerHTML.slice(0,300), scroller:!!document.querySelector("#scroller"), panels:document.querySelectorAll("body > [data-menu-panel]").length}));
    console.log(id, side, JSON.stringify(info));
    await page.evaluate(()=>window.__finchVueSpike.unmountProbe());
  }
}
await browser.close(); server.close();
