import React, {useRef} from 'react';

type Props={value:string;onChange:(value:string)=>void;disabled?:boolean;label:string;id:string};
export default function OtpInput({value,onChange,disabled=false,label,id}:Props){
 const refs=useRef<Array<HTMLInputElement|null>>([]);
 const digits=Array.from({length:6},(_,i)=>value[i]||'');
 const update=(index:number,text:string)=>{
  const cleaned=text.replace(/\D/g,'');
  if(!cleaned)return;
  const next=digits.slice();
  for(let i=0;i<cleaned.length&&index+i<6;i++)next[index+i]=cleaned[i];
  const joined=next.join('');
  onChange(joined);
  const focus=Math.min(5,index+cleaned.length);
  refs.current[focus]?.focus();
 };
 return <div className="w-full min-w-0">
  <label id={id+'-label'} className="mb-2 block text-xs font-bold text-[#0b1a42]">{label}</label>
  <div role="group" aria-labelledby={id+'-label'} className="grid grid-cols-6 gap-1.5 sm:gap-2.5 w-full max-w-[420px]">
   {digits.map((digit,index)=><input key={index}
    ref={element=>{refs.current[index]=element;}}
    aria-label={'Digit '+(index+1)+' of 6'}
    type="text" inputMode="numeric" pattern="[0-9]*" autoComplete={index===0?'one-time-code':'off'}
    disabled={disabled} maxLength={6} value={digit}
    onChange={event=>{if(event.target.value)update(index,event.target.value);else{const next=digits.slice();next[index]='';onChange(next.join(''));}}}
    onPaste={event=>{const text=event.clipboardData.getData('text').replace(/\D/g,'');if(text){event.preventDefault();onChange(text.slice(0,6));refs.current[Math.min(5,text.length)]?.focus();}}}
    onKeyDown={event=>{if(event.key==='Backspace'){event.preventDefault();const next=digits.slice();const target=digit?index:Math.max(0,index-1);next[target]='';onChange(next.join(''));refs.current[target]?.focus();}if(event.key==='ArrowLeft'){event.preventDefault();refs.current[Math.max(0,index-1)]?.focus();}if(event.key==='ArrowRight'){event.preventDefault();refs.current[Math.min(5,index+1)]?.focus();}}}
    className="h-12 sm:h-14 w-full min-w-0 rounded-xl border border-slate-200 bg-white text-center text-lg sm:text-xl font-semibold text-[#0b1a42] outline-none transition-colors focus:border-[#123578] focus:ring-2 focus:ring-[#123578]/20 disabled:bg-slate-100"
   />)}
  </div>
  <p className="mt-2 text-[11px] text-slate-500">Enter the six-digit code sent to your email. You can paste the full code.</p>
 </div>;
}
