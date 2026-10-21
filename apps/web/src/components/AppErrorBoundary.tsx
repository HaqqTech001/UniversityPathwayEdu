import React from 'react';
import StatePage from './StatePage';
type State={failed:boolean};
export default class AppErrorBoundary extends React.Component<React.PropsWithChildren,State>{
 state:State={failed:false};
 static getDerivedStateFromError():State{return {failed:true};}
 componentDidCatch(error:Error,info:React.ErrorInfo){console.error('UPEC interface error',error,info.componentStack);}
 render(){if(this.state.failed)return <StatePage kind="server" onHome={()=>{this.setState({failed:false});window.history.pushState({},'','/');window.dispatchEvent(new PopStateEvent('popstate'));}} onRetry={()=>this.setState({failed:false})}/>;return this.props.children;}
}
