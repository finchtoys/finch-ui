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
function visit(node){
  if(!node||typeof node!=='object')return;
  if(node.type==='StringLiteral'||node.type==='TemplateElement'){
    const text=node.type==='StringLiteral'?node.value:node.value.raw;
    for(const token of text.split(/\s+/))if(/^[\w:!./%-]+-\[[^\]]+\]!?$/.test(token))candidates.add(token);
  }
  for(const [k,v] of Object.entries(node))if(k!=='loc')Array.isArray(v)?v.forEach(visit):visit(v);
}
for(const file of files('components').filter(f=>/\.tsx?$/.test(f)&&!f.includes('/assets/'))){
  const src=read(file);
  assert(!/\]\$\{/.test(src),`Arbitrary utility glued to template interpolation: ${file}`);
  visit(parse(src,{sourceType:'module',plugins:['typescript','jsx']}));
}
const escape=s=>s.replace(/[^a-zA-Z0-9_-]/g,c=>`\\${c}`);
const coverage=[...candidates].sort().map(name=>{
  const selector='.'+escape(name);let found=false;const declarations=[];
  css.walkRules(rule=>{if(rule.selector.includes(selector)){rule.walkDecls(d=>declarations.push(`${d.prop}:${d.value}`));if(declarations.length)found=true;}});
  return {name,found,declarations:[...new Set(declarations)]};
});
const missing=coverage.filter(c=>!c.found);
const libraryModules=JSON.parse(read('dist/modules.json'));
const panelModules=JSON.parse(read('../lab/dist/panel/modules.json'));
const reactModules=libraryModules.filter(m=>/\/node_modules\/(react|react-dom)\//.test(m));
assert.equal(reactModules.length,0,'React MUST remain external in the library');
// Rollup CJS proxy ids have a leading NUL and query suffix; they are NOT a second package.
const roots=pkg=>[...new Set(panelModules.map(m=>m.replace(/^\u0000/, '').split('?')[0]).filter(m=>m.includes(`/node_modules/${pkg}/`)).map(m=>m.slice(0,m.indexOf(`/node_modules/${pkg}/`)+`/node_modules/${pkg}`.length)))];
assert.equal(roots('react').length,1,'Consumer must resolve exactly one React package root');
assert.equal(roots('react-dom').length,1,'Consumer must resolve exactly one ReactDOM package root');
const size=p=>{const b=readFileSync(p);return {bytes:b.length,gzip:gzipSync(b).length};};
const result={arbitraryUtilityCount:coverage.length,missing,reactRoots:roots('react'),reactDomRoots:roots('react-dom'),libraryBundledReactModules:reactModules,libraryImports:[...read('dist/index.js').matchAll(/from\s*["']([^"']+)["']/g)].map(m=>m[1]),sizes:{libraryJs:size('dist/index.js'),libraryCss:size('dist/style.css'),consumerJs:size('../lab/dist/panel/index.js'),consumerCss:size('../lab/dist/panel/index.css')},coverage};
writeFileSync('build-verification.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,coverage:`${coverage.length} exact selector + declaration checks saved to build-verification.json`},null,2));
assert.equal(missing.length,0,'Missing arbitrary utilities; see build-verification.json');
console.log('PASS: exact CSS selectors/declarations, library externals, one consumer React/ReactDOM root.');
