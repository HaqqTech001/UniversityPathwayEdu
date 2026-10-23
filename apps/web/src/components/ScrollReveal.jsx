import React, {useEffect,useRef,useState} from 'react';

/** Accessible, once-only scroll reveals with visible fallback for reduced motion. */
export default function ScrollReveal({children,from='up',delay=0,className='',as:Tag='div',threshold=0.08,once=true}){
 const ref=useRef(null);
 const [visible,setVisible]=useState(false);
 const [reduced,setReduced]=useState(()=>typeof window!=='undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true);
 useEffect(()=>{
  const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const change=()=>setReduced(Boolean(media?.matches));
  media?.addEventListener?.('change',change);
  return()=>media?.removeEventListener?.('change',change);
 },[]);
 useEffect(()=>{
  const el=ref.current;
  if(!el)return;
  if(reduced||!('IntersectionObserver' in window)){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){setVisible(true);if(once)observer.disconnect();}
   else if(!once)setVisible(false);
  },{threshold,rootMargin:'0px 0px -24px 0px'});
  observer.observe(el);
  return()=>observer.disconnect();
 },[threshold,once,reduced]);
 const offsets={left:'translate3d(-32px,0,0)',right:'translate3d(32px,0,0)',down:'translate3d(0,-24px,0)',scale:'translate3d(0,16px,0) scale(.97)',up:'translate3d(0,28px,0)'};
 const show=visible||reduced;
 return <Tag ref={ref} className={className} data-reveal={from} style={{
  opacity:show?1:0,
  transform:show?'translate3d(0,0,0) scale(1)':(offsets[from]||offsets.up),
  transition:reduced?'none':'opacity 680ms cubic-bezier(.22,1,.36,1), transform 680ms cubic-bezier(.22,1,.36,1)',
  transitionDelay:show&&!reduced?Math.max(0,delay)+'ms':'0ms'
 }}>{children}</Tag>;
}
