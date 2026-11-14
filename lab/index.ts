import type * as finch from 'finch';
// Bounded guest harness: no eval, host internals or filesystem access.
export function activate(ctx: finch.MiniToolContext): void {
  const panels=new Map<string,finch.AppPanel>();
  let last:unknown, suite:unknown;
  const errors:unknown[]=[];
  const attach=(p:finch.AppPanel)=>{
    if(panels.has(p.id))return;panels.set(p.id,p);
    ctx.subscriptions.push(p.onDidReceiveMessage(message=>{
      if(!message||typeof message!=='object')return;
      const m=message as {type?:string};
      if(m.type==='ui-lab:snapshot')last=message;
      if(m.type==='ui-lab:suite')suite=message;
      if(m.type==='ui-lab:error')errors.push(message);
    }),p.onDidDispose(()=>panels.delete(p.id)));
  };
  ctx.subscriptions.push(ctx.ui.onDidOpenPanel(attach));
  ctx.subscriptions.push(ctx.tools.register({
    name:'finch_ui_lab',title:'Finch UI Lab',risk:'low',
    description:'Inspect the local UI Lab.\naction=open: open the declared guest panel\naction=report: request fresh token measurements and return last received evidence\naction=run: run bounded synthetic DOM/portal checks inside the actual guest\naction=close: close Lab panels',
    inputSchema:{type:'object',properties:{action:{type:'string',enum:['open','report','run','close']}},required:['action']},
    async execute(input){
      const action=String(input.action);
      if(action==='open'){
        let p=[...panels.values()].at(-1);
        if(!p){p=ctx.ui.createPanel({instanceMode:'single'});attach(p);ctx.subscriptions.push(p);}
        await p.reveal();return {content:[{type:'text',text:'已打开 UI Lab；源代码为本地组件副本。'}]};
      }
      if(action==='close'){for(const p of panels.values())p.dispose();return {content:[{type:'text',text:'已关闭 UI Lab。'}]};}
      const p=[...panels.values()].at(-1);
      if(action==='run'){
        if(!p)return {content:[{type:'text',text:'面板未打开；先 open。'}],isError:true};
        suite=undefined;await p.postMessage({type:'ui-lab:run'});
        return {content:[{type:'text',text:'已启动真实 guest 内的合成 DOM/几何检查；完成后用 report 读取。不是可信鼠标/键盘输入验收。'}]};
      }
      if(action==='report'){
        if(p)await p.postMessage({type:'ui-lab:measure'});
        return {content:[{type:'text',text:JSON.stringify({lastReceived:last??null,suite:suite??null,errors},null,2)}]};
      }
      return {content:[{type:'text',text:'Unknown action'}],isError:true};
    },
  }));
}
export function deactivate():void {}
