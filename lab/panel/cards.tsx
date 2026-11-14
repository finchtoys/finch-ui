import { Component, type ErrorInfo, type ReactNode } from 'react';
import { runtimeErrors, send } from './bridge';
class Boundary extends Component<{name:string; children:ReactNode},{error:string}> {
  state = {error:''};
  static getDerivedStateFromError(error:Error) { return {error:error.message}; }
  componentDidCatch(error:Error,_info:ErrorInfo) { runtimeErrors.push(`${this.props.name}: ${error.message}`); send({type:'ui-lab:error',component:this.props.name,message:error.message}); }
  render() { return this.state.error ? <p className="lab-component-error" role="alert">不通过：{this.state.error}</p> : this.props.children; }
}
export function Card({name,note,children}:{name:string;note?:string;children:ReactNode}) {
  return <article className="lab-card" data-component={name}><h2>{name}</h2>{note&&<p className="lab-note">{note}</p>}<Boundary name={name}>{children}</Boundary></article>;
}
export function Row({children}:{children:ReactNode}) { return <div className="lab-row">{children}</div>; }
