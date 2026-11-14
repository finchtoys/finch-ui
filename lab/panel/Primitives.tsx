import { useState } from 'react';
import { Search, Star, ChevronDown } from 'lucide-react';
import { Button, ButtonGroup, Badge, Chip, ActionChip, Kbd, Alert, Empty, OptionCard, SkeletonBlock, TypingDots, WorkingText, Emoji, EmojiText, Breadcrumb, IconTabBar, ListRow, InlineActionLink } from '../../library/dist/index.js';
import { Card, Row } from './cards';

const variants = ['primary','brand','secondary','ghost','outline','danger','link'] as const;
const sizes = ['sm','md','lg'] as const;
export function Primitives() {
  const [count, setCount] = useState(0);
  const [removed, setRemoved] = useState(false);
  const [selected, setSelected] = useState(false);
  const [tab, setTab] = useState('home');
  return <>
    <Card name="Button" note="每个 variant × 三种 size；鼠标悬停/按下为原生 CSS 状态。disabled / pressed / icon / span 均为真实组件。">
      {variants.map(variant => <Row key={variant}><code>{variant}</code>{sizes.map(size => <Button key={size} variant={variant} size={size} onClick={() => setCount(n=>n+1)}>{size}</Button>)}<Button variant={variant} disabled>disabled</Button><Button variant={variant} icon={<Star size={14}/>} pressed aria-label={`${variant} pressed`}/></Row>)}
      <Row>{(['sm','md','lg','full'] as const).map(round=><Button key={round} round={round} variant="secondary">round {round}</Button>)}<Button as="span" onClick={()=>setCount(n=>n+1)}>span + keyboard</Button><output>点击 {count}</output></Row>
      <Row><Button id="probe-primary" variant="primary">Probe primary</Button><Button id="probe-secondary" variant="secondary">Probe secondary</Button><Button id="probe-disabled" disabled onClick={()=>setCount(-999)}>Probe disabled</Button></Row>
    </Card>
    <Card name="ButtonGroup"><Row>{variants.map(variant=><ButtonGroup key={variant} variant={variant} size="sm"><Button onClick={()=>setCount(n=>n+1)}>{variant}</Button><Button icon={<ChevronDown size={12}/>} aria-label="more" onClick={()=>setCount(n=>n+1)}/></ButtonGroup>)}</Row></Card>
    <Card name="Badge"><Row>{(['neutral','accent','warning','danger','success'] as const).flatMap(variant=>(['sm','md'] as const).map(size=><Badge key={variant+size} variant={variant} size={size} leadingIcon={<Star size={11}/>}>{variant} {size}</Badge>))}</Row></Card>
    <Card name="Chip / ActionChip"><Row><Chip>默认</Chip>{!removed&&<Chip onRemove={()=>setRemoved(true)} removeLabel="移除">可移除</Chip>}<ActionChip onClick={()=>setRemoved(false)}>恢复标签</ActionChip><ActionChip disabled>disabled</ActionChip><ActionChip leadingIcon={<Search size={13}/>} trailing={<Kbd>↵</Kbd>} onClick={()=>setCount(n=>n+1)}>行动</ActionChip></Row></Card>
    <Card name="Kbd"><Row>{['⌘K','Ctrl','⇧','Alt','Enter'].map(k=><Kbd key={k}>{k}</Kbd>)}</Row></Card>
    <Card name="Alert">{(['info','warning','error','success'] as const).map(variant=><Alert key={variant} variant={variant} title={variant}>说明文字与语义色</Alert>)}</Card>
    <Card name="OptionCard"><Row><OptionCard active={selected} selected={selected} onClick={()=>setSelected(!selected)}>点击选择：{String(selected)}</OptionCard><OptionCard active>active</OptionCard><OptionCard selected>selected</OptionCard><OptionCard disabled>disabled</OptionCard></Row></Card>
    <Card name="Empty"><Empty title="暂无内容" description="完整空态" icon={<Search/>}/><Empty compact title="紧凑空态"/><Empty plainIcon icon={<Star/>} title="plain icon"/></Card>
    <Card name="SkeletonBlock"><SkeletonBlock className="lab-skeleton"/><SkeletonBlock className="lab-skeleton short"/></Card>
    <Card name="TypingDots"><Row>{(['default','small','tiny'] as const).map(size=><span key={size}>{size} <TypingDots size={size}/></span>)}</Row></Card>
    <Card name="WorkingText"><Row>{(['primary','secondary','tertiary','accent'] as const).map(tone=><WorkingText key={tone} active tone={tone}>{tone}</WorkingText>)}<WorkingText>inactive</WorkingText></Row></Card>
    <Card name="Emoji / EmojiText" note="SVG 子集命中必须真加载图片；未命中显示系统字体，不将回退算作 SVG 通过。"><Row><span id="probe-emoji"><Emoji text="😀"/></span><Emoji text="❤️"/><EmojiText text="混合文字 🌟 👋 开发者"/><Emoji text="🫩"/></Row></Card>
    <Card name="Breadcrumb"><Breadcrumb ariaLabel="UI Lab 路径" items={[{label:'首页',onClick:()=>setTab('home')},{label:'很长的中间层标题用于检查省略行为',onClick:()=>setTab('middle')},{label:'当前页',active:true}]}/></Card>
    <Card name="IconTabBar"><IconTabBar activeKey={tab} onChange={setTab} tabs={[{key:'home',icon:<Star size={14}/>,label:'首页'},{key:'search',icon:<Search size={14}/>,label:'搜索',badge:3},{key:'end',icon:<ChevronDown size={14}/>,label:'末尾',align:'end',iconOnly:true}]}/></Card>
    <Card name="ListRow">{[false,true].map((active,i)=><ListRow key={i} isActive={active} title={active?'active row':'default / hover row'} subtitle="辅助文字" icon={<Star size={14}/>} meta={<Badge>meta</Badge>} onClick={()=>setCount(n=>n+1)} floatContent={<Button size="sm" onClick={()=>setCount(n=>n+1)}>操作</Button>}/>)}<ListRow title="monospace/path" titleMono indent={12}/></Card>
    <Card name="InlineActionLink"><Row><InlineActionLink leadingIcon={<Star size={13}/>} onClick={()=>setCount(n=>n+1)}>可交互链接</InlineActionLink><InlineActionLink disabled>disabled</InlineActionLink></Row></Card>
  </>;
}
