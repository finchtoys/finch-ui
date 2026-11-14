// Explicit source-copy adaptation. Never writes src/renderer/ui or host styles.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
const here = dirname(new URL(import.meta.url).pathname);
// The component library is extracted FROM the Finch app repo. Point this at a
// checkout of it (env FINCH_REPO wins) — the published repo does not contain it.
const repo = process.env.FINCH_REPO ? resolve(process.env.FINCH_REPO) : resolve(here, '../../finch');
const origin = resolve(repo, 'src/renderer/ui');
const dest = resolve(here, 'components');
mkdirSync(dest, { recursive: true });
const tokens = postcss.parse(readFileSync(resolve(repo, 'src/renderer/styles/tokens.css'), 'utf8'));
const presets = tokens.nodes.filter(n => n.type === 'rule' && [':root', ':root[data-theme="dark"]'].includes(n.selector));
const canonical = new Set();
for (const rule of presets) rule.walkDecls(d => { if (d.prop.startsWith('--')) canonical.add(d.prop); });
const transform = text => text.replace(/--[a-zA-Z][a-zA-Z0-9-]*/g, name => canonical.has(name) ? `--ui-${name.slice(2)}` : name);
const receipts = [];
const copy = (from, to) => {
  const raw = readFileSync(from, 'utf8');
  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, transform(raw));
  receipts.push({ source: from.slice(repo.length + 1), target: to.slice(here.length + 1), sha256: createHash('sha256').update(raw).digest('hex') });
};
for (const name of readdirSync(origin)) {
  if (/\.(tsx|ts)$/.test(name) && !name.includes('.test.')) copy(resolve(origin, name), resolve(dest, name));
}
for (const folder of ['hooks', 'emoji']) {
  for (const name of readdirSync(resolve(origin, folder))) {
    if (!name.includes('.test.') && /\.tsx?$/.test(name)) copy(resolve(origin, folder, name), resolve(dest, folder, name));
  }
}
cpSync(resolve(origin, 'assets'), resolve(dest, 'assets'), { recursive: true });
// Only component styles. Remove business selectors, retain shared halves of mixed rules.
for (const name of ['primitives.css', 'overlays.css']) {
  const tree = postcss.parse(readFileSync(resolve(origin, 'styles', name), 'utf8'));
  tree.walkComments(c => c.remove());
  tree.walkRules(rule => {
    const selectors = rule.selector.split(',').filter(s => !/bot-row|knowledgeScrollArea|rightSidebar|quotaHoverCard|annotationTooltip/.test(s));
    if (!selectors.length) rule.remove(); else rule.selector = selectors.join(',');
  });
  tree.walkAtRules('keyframes', rule => { if (rule.params === 'rightSidebarDeliveryFlash') rule.remove(); });
  writeFileSync(resolve(here, 'styles', name), transform(tree.toString()));
}
const allTokens = [...canonical];
const blocks = presets.map(rule => {
  const mode = rule.selector.includes('dark') ? ':root:where([data-theme="dark"])' : ':root';
  const declarations = rule.nodes.filter(d => d.type === 'decl' && canonical.has(d.prop));
  return `${mode} {\n${declarations.map(d => `  --ui-fallback-${d.prop.slice(2)}: ${transform(d.value)};`).join('\n')}\n}`;
});
const injected = new Set(['bg-root','bg-main','bg-elevated','bg-hover','bg-active','text-primary','text-secondary','text-tertiary','accent','accent-hover','accent-dim','border','border-subtle','border-strong','positive','warning','danger','info','info-strong','radius-sm','radius-md','radius-lg','radius-full','shadow-sm','shadow-md','font-body','font-mono']);
blocks.push(`:root {\n${allTokens.map(t => {
  const key = t.slice(2);
  return `  --ui-${key}: ${injected.has(key) ? `var(--finch-${key}, var(--ui-fallback-${key}))` : `var(--ui-fallback-${key})`};`;
}).join('\n')}\n}`);
// Override only private tokens for preview-only theme buttons; never claim host injection.
blocks.push(':root[data-preview="light"], :root[data-preview="dark"], :root[data-preview="custom"] {\n' + [...injected].map(k => `  --ui-${k}: var(--ui-fallback-${k});`).join('\n') + '\n}');
blocks.push(':root[data-preview="custom"] { --ui-bg-main:#faf8ff; --ui-bg-root:#faf8ff; --ui-bg-elevated:#ece6ff; --ui-bg-hover:#e2daff; --ui-bg-active:#d6cbff; --ui-text-primary:#2a1a4a; --ui-text-secondary:#5b4a80; --ui-text-tertiary:#8578a8; --ui-accent:#7c5cff; --ui-accent-dim:#ece6ff; --ui-border:#d6cbff; }');
writeFileSync(resolve(here, 'styles/tokens.css'), '/* Generated private fallbacks. Public --finch-* are NEVER declared here. */\n' + blocks.join('\n'));
const theme = tokens.nodes.find(n => n.type === 'atrule' && n.name === 'theme');
writeFileSync(resolve(here, 'styles/theme.css'), '@theme inline {\n' + theme.nodes.filter(d => d.type === 'decl').map(d => `  ${d.prop}: ${transform(d.value)};`).join('\n') + '\n}');
const animations = postcss.parse(readFileSync(resolve(repo, 'src/renderer/styles/base/animations.css'), 'utf8'));
animations.nodes.filter(n => n.type !== 'atrule').forEach(n => n.remove());
writeFileSync(resolve(here, 'styles/animations.css'), animations.toString());
const shell = postcss.parse(readFileSync(resolve(repo, 'src/renderer/styles/components/settings/settings.css'), 'utf8')).nodes.find(n => n.type === 'rule' && n.selector === '.settingsModalShell');
writeFileSync(resolve(here, 'styles/host-gaps.css'), '/* Required host-owned style, copied explicitly; extraction is not self-contained without this. */\n' + transform(shell.toString()) + '\n.twemoji { display:inline-block; width:1em; height:1em; vertical-align:-0.15em; object-fit:contain; }\n');
writeFileSync(resolve(here, 'copy-manifest.json'), JSON.stringify({ adaptation: 'Canonical host CSS variables mechanically renamed to private --ui-*; logic unchanged. LiquidGlassFilter is a transitive Toast dependency, not a public export.', files: receipts }, null, 2));
const exports = readdirSync(origin).filter(n => n.endsWith('.tsx') && !n.includes('.test.') && n !== 'LiquidGlassFilter.tsx');
writeFileSync(resolve(here, 'entry.ts'), 'import "./styles/finch-ui.css";\n' + exports.map(n => `export * from "./components/${n.slice(0,-4)}";`).join('\n') + '\n');
console.log(`Synced ${exports.length} component modules, ${receipts.length} source files; public host tokens remain read-only.`);
