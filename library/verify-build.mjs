import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { parse } from '@babel/parser';
import postcss from 'postcss';
const read=p=>readFileSync(p,'utf8');
const files=(dir)=>readdirSync(dir).flatMap(n=>statSync(`${dir}/${n}`).isDirectory()?files(`${dir}/${n}`):[`${dir}/${n}`]);
const css=postcss.parse(read('dist/style.css'));
const candidates=new Set();

// Class strings for the migrated components live in styles/classes.ts, so it
// MUST be scanned together with the components — otherwise the arbitrary-value
// coverage assertion below silently stops checking the real source of truth.
const CLASS_SOURCE = 'styles/classes.ts';
const SCANNED_FILES = [
  ...files('components').filter(f=>/\.tsx?$/.test(f)&&!f.includes('/assets/')),
  CLASS_SOURCE,
];

function visit(node){
  if(!node||typeof node!=='object')return;
  if(node.type==='StringLiteral'||node.type==='TemplateElement'){
    const text=node.type==='StringLiteral'?node.value:node.value.raw;
    for(const token of text.split(/\s+/))if(/^[\w:!./%-]+-\[[^\]]+\]!?$/.test(token))candidates.add(token);
  }
  for(const [k,v] of Object.entries(node))if(k!=='loc')Array.isArray(v)?v.forEach(visit):visit(v);
}
for(const file of SCANNED_FILES){
  const src=read(file);
  assert(!/\]\$\{/.test(src),`Arbitrary utility glued to template interpolation: ${file}`);
  visit(parse(src,{sourceType:'module',plugins:['typescript','jsx']}));
}

// Migrated components must not grow class literals again: that is exactly how
// the second copy of a class string reappears. Keep this list in sync when
// migrating more components.
const SHARED_CLASS_COMPONENTS=[
  'components/Button.tsx',
  'components/Input.tsx',
  'components/ToggleSwitch.tsx',
  'components/ModalShell.tsx',
  'components/Menu.tsx',
  'components/Badge.tsx',
  'components/Chip.tsx',
  'components/Kbd.tsx',
];
const UTILITY_TOKEN=/^(?:[a-z-]+:)*(?:flex|grid|block|inline-flex|inline-block|hidden|relative|absolute|fixed|sticky|items-[\w-]+|justify-[\w-]+|gap-[\w.-]+|p[xytblr]?-[\w.[\]%-]+|m[xytblr]?-[\w.[\]%-]+|w-[\w.[\]%/%-]+|h-[\w.[\]%/%-]+|min-[\w-]+|max-[\w-]+|text-[\w.[\]%/%-]+|bg-[\w.[\]%/%-]+|border(?:-[\w.[\]%/%-]+)?|rounded(?:-[\w.[\]%/%-]+)?|font-[\w-]+|shadow(?:-[\w.[\]%()-]+)?|transition(?:-[\w.[\]%,()-]+)?|animate-[\w-]+|overflow-[\w-]+|z-[\w-]+|cursor-[\w-]+|select-[\w-]+|whitespace-[\w-]+|truncate|leading-[\w-]+|tracking-[\w-]+|opacity-[\w.-]+|ring(?:-[\w.[\]%/%-]+)?|scale-[\w.-]+|underline|no-underline|space-[xy]-[\w.-]+)$/;
function classishLiterals(src){
  const found=[];
  const walk=node=>{
    if(!node||typeof node!=='object')return;
    if(node.type==='StringLiteral'||node.type==='TemplateElement'){
      const text=node.type==='StringLiteral'?node.value:node.value.raw;
      const tokens=text.split(/\s+/).filter(Boolean);
      if(tokens.some(token=>UTILITY_TOKEN.test(token)))found.push({text,loc:node.loc?.start.line});
    }
    for(const [k,v] of Object.entries(node))if(k!=='loc')Array.isArray(v)?v.forEach(walk):walk(v);
  };
  walk(parse(src,{sourceType:'module',plugins:['typescript','jsx']}));
  return found;
}
function classishTokens(src){
  const tokens=new Set();
  const walk=node=>{
    if(!node||typeof node!=='object')return;
    if(node.type==='StringLiteral'||node.type==='TemplateElement'){
      const text=node.type==='StringLiteral'?node.value:node.value.raw;
      for(const token of text.split(/\s+/))if(token&&UTILITY_TOKEN.test(token))tokens.add(token);
    }
    for(const [k,v] of Object.entries(node))if(k!=='loc')Array.isArray(v)?v.forEach(walk):walk(v);
  };
  walk(parse(src,{sourceType:'module',plugins:['typescript','jsx']}));
  return tokens;
}
for(const file of SHARED_CLASS_COMPONENTS){
  const leaked=classishLiterals(read(file));
  assert.equal(
    leaked.length,0,
    `Class string outside ${CLASS_SOURCE}: ${file}:${leaked[0]?.loc} → ${JSON.stringify(leaked[0]?.text)}`,
  );
}

const escape=s=>s.replace(/[^a-zA-Z0-9_-]/g,c=>`\\${c}`);
const coverage=[...candidates].sort().map(name=>{
  const selector='.'+escape(name);let found=false;const declarations=[];
  css.walkRules(rule=>{if(rule.selector.includes(selector)){rule.walkDecls(d=>declarations.push(`${d.prop}:${d.value}`));if(declarations.length)found=true;}});
  return {name,found,declarations:[...new Set(declarations)]};
});
const missing=coverage.filter(c=>!c.found);

// ── 全量 token 覆盖 ──────────────────────────────────────────────────────────
// 上面只查「任意值」utility。但把 class 字符串搬进 styles/classes.ts 之后，
// 漏掉 finch-ui.css 里的 @source "./classes.ts" 会让**普通** utility 也一起
// 消失（Tailwind 只扫组件目录），而任意值检查看不到它们。这里把已迁移来源里
// 出现的每个 utility token 都拿去找规则：「只改一处」的半拉子重构当场变红。
function hasRuleFor(name){
  const selector='.'+escape(name);
  let found=false;
  css.walkRules(rule=>{
    if(found||!rule.selector.includes(selector))return;
    rule.walkDecls(()=>{found=true;});
  });
  return found;
}
const tokenSources=[CLASS_SOURCE,...SHARED_CLASS_COMPONENTS];
const tokenMap=new Map();
for(const file of tokenSources){
  for(const token of classishTokens(read(file))){
    if(!tokenMap.has(token))tokenMap.set(token,[]);
    const owners=tokenMap.get(token);
    if(!owners.includes(file))owners.push(file);
  }
}
const uncoveredTokens=[...tokenMap.entries()].filter(([token])=>!hasRuleFor(token)).map(([token,owners])=>({token,owners}));
assert.equal(
  uncoveredTokens.length,0,
  `Utility 在编译产物里没有规则（检查 styles/finch-ui.css 的 @source 是否覆盖了来源文件）: ${
    uncoveredTokens.slice(0,8).map(t=>`${t.token} ← ${t.owners.join(',')}`).join(' | ')
  }`,
);

const libraryModules=JSON.parse(read('dist/modules.json'));
const panelModules=JSON.parse(read('../lab/dist/panel/modules.json'));
const reactModules=libraryModules.filter(m=>/\/node_modules\/(react|react-dom)\//.test(m));
assert.equal(reactModules.length,0,'React MUST remain external in the library');
// Rollup CJS proxy ids have a leading NUL and query suffix; they are NOT a second package.
const roots=pkg=>[...new Set(panelModules.map(m=>m.replace(/^\u0000/, '').split('?')[0]).filter(m=>m.includes(`/node_modules/${pkg}/`)).map(m=>m.slice(0,m.indexOf(`/node_modules/${pkg}/`)+`/node_modules/${pkg}`.length)))];
assert.equal(roots('react').length,1,'Consumer must resolve exactly one React package root');
assert.equal(roots('react-dom').length,1,'Consumer must resolve exactly one ReactDOM package root');
const size=p=>{const b=readFileSync(p);return {bytes:b.length,gzip:gzipSync(b).length};};
const result={arbitraryUtilityCount:coverage.length,checkedUtilityTokens:tokenMap.size,uncoveredTokens,missing,reactRoots:roots('react'),reactDomRoots:roots('react-dom'),libraryBundledReactModules:reactModules,libraryImports:[...read('dist/index.js').matchAll(/from\s*["']([^"']+)["']/g)].map(m=>m[1]),sizes:{libraryJs:size('dist/index.js'),libraryCss:size('dist/style.css'),consumerJs:size('../lab/dist/panel/index.js'),consumerCss:size('../lab/dist/panel/index.css')},coverage};
writeFileSync('build-verification.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,coverage:`${coverage.length} arbitrary-value checks + ${tokenMap.size} full token checks saved to build-verification.json`},null,2));
assert.equal(missing.length,0,'Missing arbitrary utilities; see build-verification.json');
console.log('PASS: exact CSS selectors/declarations, library externals, one consumer React/ReactDOM root.');
