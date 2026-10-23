import React,{useEffect,useState} from 'react';
export type ToastKind='success'|'error'|'warning'|'info';
type ToastItem={id:number;type:ToastKind;message:string;duration:number};
export function notifyPortal(type:ToastKind,message:string,duration=5000){
 window.dispatchEvent(new CustomEvent('pathway:toast',{detail:{type,message,duration}}));
}
export default function PortalToasts(){
 const [items,setItems]=useState<ToastItem[]>([]);
 useEffect(()=>{
  let counter=0;
  const timers=new Map<number,ReturnType<typeof setTimeout>>();
  const receive=(event:Event)=>{
   const detail=(event as CustomEvent).detail||{};
   const id=++counter;
   const duration=Math.max(1800,Math.min(12000,Number(detail.duration)||5000));
   setItems(old=>[...old.slice(-3),{id,type:['success','error','warning','info'].includes(detail.type)?detail.type:'info',message:String(detail.message||''),duration}]);
   timers.set(id,setTimeout(()=>setItems(old=>old.filter(item=>item.id!==id)),duration));
  };
  window.addEventListener('pathway:toast',receive);
  return()=>{window.removeEventListener('pathway:toast',receive);timers.forEach(clearTimeout);};
 },[]);
 const accent={success:'#0e9f62',error:'#d12f45',warning:'#d49322',info:'#245fca'};
 return <div aria-live="polite" className="pointer-events-none fixed right-3 top-3 z-[9999] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-5">
  {items.map(item=><div key={item.id} role={item.type==='error'?'alert':'status'} className="pointer-events-auto relative overflow-hidden rounded-2xl border px-4 py-4 shadow-[0_16px_45px_rgba(6,15,38,.20)]" style={{backgroundColor:({success:'#ecfff5',error:'#fff0f1',warning:'#fff7df',info:'#edf4ff'} as Record<string,string>)[item.type],borderColor:accent[item.type],animation:'pathway-toast-in 280ms ease-out both'}} >
   <div className="flex items-start gap-3"><span className="mt-0.5 font-extrabold" style={{color:accent[item.type]}}>{item.type==='success'?'✓':item.type==='error'?'!':item.type==='warning'?'⚠':'i'}</span><div className="min-w-0 flex-1"><strong className="block text-sm capitalize text-[#111A43]">{item.type}</strong><p className="mt-0.5 break-words text-sm text-slate-600">{item.message}</p></div><button type="button" aria-label="Dismiss notification" className="rounded p-1 text-slate-500 hover:bg-slate-100" onClick={()=>setItems(old=>old.filter(x=>x.id!==item.id))}>×</button></div>
   <div className="absolute bottom-0 left-0 h-[3px] w-full" style={{backgroundColor:accent[item.type],transformOrigin:'left',animation:'pathway-toast-drain '+item.duration+'ms linear forwards'}}/>
  </div>)}
  <style>{`@keyframes pathway-toast-in{from{opacity:0;transform:translate3d(24px,-8px,0)}to{opacity:1;transform:translate3d(0,0,0)}}@keyframes pathway-toast-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}@media(prefers-reduced-motion:reduce){.pointer-events-auto[role="status"],.pointer-events-auto[role="alert"]{animation:none!important}}`}</style>
 </div>;
}
