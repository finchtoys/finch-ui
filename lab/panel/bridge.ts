import type * as finch from 'finch';
export const bridge = (window as Window & { finch?: finch.WebviewBridgeApi }).finch;
export const send = (message: unknown) => bridge?.postMessage(message);
export const runtimeErrors: string[] = [];
window.addEventListener('error', e => { runtimeErrors.push(e.message); send({type:'ui-lab:error', message:e.message}); });
window.addEventListener('unhandledrejection', e => { runtimeErrors.push(String(e.reason)); send({type:'ui-lab:error', message:String(e.reason)}); });
const originalError = console.error.bind(console);
console.error = (...args: unknown[]) => { const message = args.map(String).join(' '); runtimeErrors.push(message); originalError(...args); };
