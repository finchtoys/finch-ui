// Runs INSIDE the real guest. These are synthetic DOM interactions, not trusted input.
import { runtimeErrors } from './bridge';
type Check = { name:string; pass:boolean; detail:unknown };
const pause = (ms=230) => new Promise(resolve=>setTimeout(resolve,ms));
const rect = (el:Element) => { const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}; };
const inside = (el:Element) => { const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.x>=-1&&r.y>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1; };
const click = (selector:string) => { const el=document.querySelector<HTMLElement>(selector);if(!el)throw Error(`Missing ${selector}`);el.click(); };
// React onMouseEnter/Leave are synthesized from mouseover/mouseout; Tooltip ignores non-:focus-visible focus().
const hoverOn = (selector:string) => document.querySelector(selector)!.dispatchEvent(new MouseEvent('mouseover',{bubbles:true,relatedTarget:document.body}));
const hoverOff = (selector:string) => document.querySelector(selector)!.dispatchEvent(new MouseEvent('mouseout',{bubbles:true,relatedTarget:document.body}));
const escape = () => document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
export async function runSelfTest() {
  const checks:Check[]=[];
  const add=(name:string,pass:boolean,detail:unknown)=>checks.push({name,pass,detail});
  const top=scrollY;
  try {
    const card=document.querySelector<HTMLElement>('[data-component="Tooltip / HoverCard"]')!;
    await pause(350); // Let the run-button/header layout settle before measuring.
    card.scrollIntoView({block:'start'});await pause(300);
    const scroller=document.querySelector<HTMLElement>('#portal-scroll')!;scroller.scrollTop=0;await pause();
    click('#test-menu');await pause(350);
    const menu=document.querySelector<HTMLElement>('.test-menu');
    add('Menu portal parent/fixed/viewport',!!menu&&menu.parentElement===document.body&&getComputedStyle(menu).position==='fixed'&&inside(menu),menu?rect(menu):'missing');
    if(menu) {
      const a=document.querySelector('#test-menu')!;
      const before={menu:rect(menu),anchor:rect(a)};
      scroller.scrollTop=20;await pause();
      const after={menu:rect(menu),anchor:rect(a)};
      const relativeBefore=before.menu.y-before.anchor.y,relativeAfter=after.menu.y-after.anchor.y;
      add('Menu follows nested scroll',Math.abs(relativeBefore-relativeAfter)<2&&Math.abs(after.anchor.y-before.anchor.y)>10,{before,after});
      const r=menu.getBoundingClientRect();const hit=document.elementFromPoint(r.x+Math.min(12,r.width/2),r.y+Math.min(12,r.height/2));
      add('Menu escapes overflow clipping (hit test)',!!hit&&menu.contains(hit),{hit:hit?.tagName});
    }
    escape();await pause(400);
    scroller.scrollTop=0;await pause();
    hoverOn('#test-tooltip');await pause(400);
    const tip=document.querySelector<HTMLElement>('.test-tooltip');
    add('Tooltip portal fixed/viewport',!!tip&&tip.parentElement===document.body&&getComputedStyle(tip).position==='fixed'&&inside(tip),tip?rect(tip):'missing');
    scroller.scrollTop=12;await pause(400);
    add('Tooltip closes on scroll (designed behavior)',!document.querySelector('.test-tooltip'),{remaining:!!document.querySelector('.test-tooltip')});
    hoverOff('#test-tooltip');
    scroller.scrollTop=0;await pause();
    hoverOn('#test-hover');await pause(450);
    const hover=document.querySelector<HTMLElement>('.test-hover');
    add('HoverCard portal fixed/viewport',!!hover&&hover.parentElement===document.body&&getComputedStyle(hover).position==='fixed'&&inside(hover),hover?rect(hover):'missing');
    if(hover){const before=rect(hover);scroller.scrollTop=20;await pause();const after=rect(hover);add('HoverCard follows nested scroll',Math.abs(after.y-before.y+20)<2,{before,after});}
    hoverOff('#test-hover');await pause(400);
    // Test gallery explicitly enables portal=true (source default is false).
    scroller.scrollTop=0;click('.test-dropdown button');await pause(350);
    const dropdown=document.querySelector<HTMLElement>('body > [data-menu-panel="true"]');
    add('DropdownSelect body portal',!!dropdown&&inside(dropdown),dropdown?rect(dropdown):'missing');
    escape();await pause(350);
    click('#test-modal');await pause(450);
    const modal=document.querySelector<HTMLElement>('[data-finch-modal-shell]');
    add('Modal body portal fills guest viewport',!!modal&&modal.parentElement===document.body&&Math.abs(modal.getBoundingClientRect().height-innerHeight)<2,modal?rect(modal):'missing');
    click('#test-nested');await pause(400);escape();await pause(300);
    add('Modal Esc closes only top layer',document.querySelectorAll('[data-finch-modal-shell]').length===1,{count:document.querySelectorAll('[data-finch-modal-shell]').length});
    escape();await pause(250);
    click('#test-confirm');await pause(400);
    add('ConfirmDialog visible alertdialog',!!document.querySelector('[role="alertdialog"]'),{count:document.querySelectorAll('[role="alertdialog"]').length});
    escape();await pause();
    click('#test-toast');await pause(650);
    const toast=document.querySelector('.toastCard');add('Toast singleton renders real card',!!toast&&inside(toast),toast?rect(toast):'missing');
    const sw=document.querySelector<HTMLElement>('.probe-switch')!;const old=sw.getAttribute('aria-checked');sw.click();await pause();
    add('ToggleSwitch state changes',sw.getAttribute('aria-checked')!==old,{before:old,after:sw.getAttribute('aria-checked')});sw.click();
    const image=document.querySelector<HTMLImageElement>('#probe-emoji img');
    add('Emoji SVG decoded, not system fallback',!!image&&image.complete&&image.naturalWidth>0,{complete:image?.complete,naturalWidth:image?.naturalWidth,source:image?.src.slice(0,80)});
    add('No captured runtime/React errors',runtimeErrors.length===0,[...runtimeErrors]);
  } catch(error) {add('suite exception',false,String(error));}
  finally {escape();window.scrollTo(0,top);}
  return {source:'real Finch guest; synthetic DOM clicks/focus + layout measurements, NOT real pointer/keyboard',viewport:{width:innerWidth,height:innerHeight},checks};
}
