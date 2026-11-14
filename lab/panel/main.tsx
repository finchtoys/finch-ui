import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, SegmentedControl } from '../../library/dist/index.js';
import '../../library/dist/style.css';
import './gallery.css';
import { bridge, runtimeErrors, send } from './bridge';
import { Primitives } from './Primitives';
import { Forms } from './Forms';
import { Overlays } from './Overlays';
import { runSelfTest } from './selfTest';
type Preview = 'host'|'light'|'dark'|'custom';
const keys=['bg-main','bg-elevated','bg-hover','accent','text-primary','border'];
const snapshots:unknown[]=[];
function measure() {
  const root=document.documentElement, css=getComputedStyle(root);
  const base=Object.fromEntries(keys.map(k=>[k,css.getPropertyValue(`--finch-${k}`).trim()]));
  const sample=(token:string)=>{const el=document.createElement('span');el.style.color=`var(--ui-${token})`;document.body.append(el);const value=getComputedStyle(el).color;el.remove();return value;};
  return {
    mode:css.getPropertyValue('--finch-theme-mode').trim()||'standalone',preview:root.dataset.preview||'host',base,
    effective:Object.fromEntries(['bg-inset','text-inverse','danger-dim','accent','info','info-strong'].map(k=>[k,sample(k)])),
    primary:document.querySelector('#probe-primary')?getComputedStyle(document.querySelector('#probe-primary')!).backgroundColor:null,
    secondary:document.querySelector('#probe-secondary')?getComputedStyle(document.querySelector('#probe-secondary')!).backgroundColor:null,
    switchTrack:document.querySelector('.probe-switch')?getComputedStyle(document.querySelector('.probe-switch')!).backgroundColor:null,
    mountedCards:document.querySelectorAll('[data-component]').length,
    componentFailures:Array.from(document.querySelectorAll('.lab-component-error')).map(e=>e.textContent),
    errors:[...runtimeErrors],
  };
}
function App() {
  const [preview,setPreview]=useState<Preview>('host'),[report,setReport]=useState<ReturnType<typeof measure>|null>(null),[suite,setSuite]=useState<Awaited<ReturnType<typeof runSelfTest>>|null>(null),[running,setRunning]=useState(false);
  const run=async()=>{setSuite(null);setRunning(true);try{const result=await runSelfTest();setSuite(result);send({type:'ui-lab:suite',result});}finally{setRunning(false);}};
  useEffect(()=>{
    const root=document.documentElement;let signature='';
    const poll=()=>{
      const host=getComputedStyle(root).getPropertyValue('--finch-theme-mode').trim();
      root.dataset.preview=preview;
      root.dataset.theme=preview==='host'?(host==='dark'?'dark':host==='light'?'light':matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):preview==='dark'?'dark':'light';
      const next=measure(), sig=JSON.stringify(next);
      if(sig!==signature){signature=sig;setReport(next);snapshots.push({time:new Date().toISOString(),...next});if(snapshots.length>24)snapshots.shift();send({type:'ui-lab:snapshot',latest:next,snapshots:[...snapshots]});}
    };poll();const id=setInterval(poll,400);
    return()=>clearInterval(id);
  },[preview]);
  useEffect(()=>bridge?.onMessage(message=>{
    if(!message||typeof message!=='object')return;
    const m=message as {type?:string};
    if(m.type==='ui-lab:measure')send({type:'ui-lab:snapshot',latest:measure(),snapshots:[...snapshots]});
    if(m.type==='ui-lab:run')void run();
  }),[]);
  return <>
    <header className="lab-header"><h1>Finch UI Lab</h1><p>本地副本 · 独立预编译 CSS · A/B 档全目录</p>
      <SegmentedControl value={preview} onChange={setPreview} options={[{value:'host',label:'跟随宿主'},{value:'light',label:'本页浅色'},{value:'dark',label:'本页深色'},{value:'custom',label:'本页紫色皮肤'}]}/>
      <p className="lab-note">“本页”只改预览，不修改 Finch。真正验证宿主皮肤请选“跟随宿主”，再去换肤工坊切换。</p>
      <details open><summary>当前读取值 / 缺口</summary><div className="lab-tokens">{report&&Object.entries(report.base).map(([k,v])=><code key={k}>--finch-{k}: {v||'未注入'}</code>)}<code>mode: {report?.mode}; preview: {report?.preview}</code><code>Button primary: {report?.primary}</code><code>derived inset: {report?.effective['bg-inset']}</code></div>
      <p className="lab-warning">缺失白名单 token 使用本地推导/回退，不等于完整宿主契约。Tooltip/HoverCard 的倒置固定色、Toast 的液态玻璃、Emoji 的 Vite 资产构建均有边界；详见验证文档。</p></details>
      <Button variant="secondary" disabled={running} onClick={()=>void run()}>{running?'正在测量…':'运行 guest DOM / portal 自测'}</Button>
      {suite&&<details open><summary>自测 {suite.checks.filter(c=>c.pass).length}/{suite.checks.length}；合成事件，非真人输入验收</summary>{suite.checks.map(c=><p key={c.name} className={c.pass?'lab-pass':'lab-fail'}>{c.pass?'通过':'不通过'} · {c.name}</p>)}</details>}
      <nav>{['原语','表单','浮层'].map((n,i)=><a key={n} href={`#group-${i}`}>{n}</a>)}</nav>
    </header>
    <main><section id="group-0" className="lab-grid"><Primitives/></section><section id="group-1" className="lab-grid"><Forms/></section><section id="group-2" className="lab-grid"><Overlays/></section></main>
    <footer>每张卡片均来自本地复制的真实组件。无 disabled 等 API 的组件不伪造状态；hover 用真实鼠标悬停查看。</footer>
  </>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
