import React, { useEffect, useRef, useState } from 'react';

/** Scroll-triggered, once-only entrance; styles do not rely on Tailwind class extraction. */
export default function ScrollReveal({ children, from='up', delay=0, className='', as:Tag='div', threshold=0.08, once=true }) {
  const ref=useRef(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const element=ref.current;
    if(!element)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced||!('IntersectionObserver' in window)){setVisible(true);return;}
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        setVisible(true);
        if(once)observer.disconnect();
      }else if(!once){setVisible(false);}
    },{threshold,rootMargin:'0px 0px -36px 0px'});
    observer.observe(element);
    return()=>observer.disconnect();
  },[threshold,once]);
  const offsets={left:'translate3d(-44px,0,0)',right:'translate3d(44px,0,0)',down:'translate3d(0,-32px,0)',scale:'translate3d(0,20px,0) scale(.96)',up:'translate3d(0,38px,0)'};
  return <Tag ref={ref} className={className} data-reveal={from} style={{
    opacity:visible?1:0,
    transform:visible?'translate3d(0,0,0) scale(1)':(offsets[from]||offsets.up),
    transition:'opacity 780ms cubic-bezier(.22,1,.36,1), transform 780ms cubic-bezier(.22,1,.36,1)',
    transitionDelay:visible?Math.max(0,delay)+'ms':'0ms'
  }}>{children}</Tag>;
}
