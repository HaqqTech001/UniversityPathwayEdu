import React, {useEffect,useState} from 'react';

type FeeType='monthly'|'registration';
type Rate={id:string;programme_code:string;effective_month:string;monthly_amount_ngn?:number;amount_ngn?:number};
const root=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
const path=(type:FeeType)=>root+'/api/staff/finance/'+(type==='monthly'?'programme-rates':'registration-rates');
const auth=()=>({Authorization:'Bearer '+sessionStorage.getItem('upec_staff_token')});
async function parse(response:Response){const data=await response.json();if(!response.ok)throw Error(data.error||'Request failed.');return data;}
const currency=(n:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);

export default function FeeRateManager(){
  const [type,setType]=useState<FeeType>('monthly');
  const [rates,setRates]=useState<Rate[]>([]);
  const [programme,setProgramme]=useState('IJMB');
  const [amount,setAmount]=useState('');
  const [month,setMonth]=useState(()=>new Date().toISOString().slice(0,7));
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [reload,setReload]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);setRates([]);setError('');
    parseRequest();
    async function parseRequest(){
      try{const data=await parse(await fetch(path(type),{headers:auth(),signal:controller.signal}));if(!controller.signal.aborted)setRates(data.rates||[]);}
      catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Unable to load fee rates.');}
      finally{if(!controller.signal.aborted)setLoading(false);}
    }
    return()=>controller.abort();
  },[type,reload]);
  const save=async(event:React.FormEvent)=>{
    event.preventDefault();
    const value=Number(amount);
    if(!amount.trim()||!Number.isFinite(value)||value<0||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)){setError('Enter a valid fee and effective month.');return;}
    if(!window.confirm('Create '+type+' fee of '+currency(value)+' for '+programme+' effective '+month+'? This may affect student billing.'))return;
    setSaving(true);setError('');setNotice('');
    try{
      const data=await parse(await fetch(path(type),{method:'POST',headers:{...auth(),'Content-Type':'application/json'},
        body:JSON.stringify({programmeCode:programme,effectiveMonth:month+'-01',...(type==='monthly'?{monthlyAmountNgn:value}:{amountNgn:value})})}));
      setNotice(type==='monthly'?(data.notificationError?'Fee saved, but notification delivery reported an error.':'Monthly fee saved. Check notification delivery separately.'):'Registration fee saved.');
      setAmount('');setReload(n=>n+1);
    }catch(e){setError(e instanceof Error?e.message:'Unable to save fee.');}
    finally{setSaving(false);}
  };
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
    <div><h2 className="text-lg font-bold text-[#111A43]">Programme fee management</h2><p className="text-xs text-slate-500">Create effective-dated rates independently for IJMB, JAMB and WAEC. Existing rate history remains visible.</p></div>
    <div className="flex gap-2">{(['monthly','registration'] as const).map(item=><button type="button" key={item} onClick={()=>setType(item)} className={'rounded-lg px-3 py-2 text-xs font-bold '+(type===item?'bg-[#111A43] text-white':'border border-slate-200')}>{item==='monthly'?'Monthly lessons':'Registration'}</button>)}</div>
    <form onSubmit={save} className="flex flex-wrap items-end gap-3">
      <label className="text-xs font-semibold">Programme<select value={programme} onChange={e=>setProgramme(e.target.value)} className="mt-1 block rounded-lg border p-2">{['IJMB','JAMB','WAEC'].map(item=><option key={item}>{item}</option>)}</select></label>
      <label className="text-xs font-semibold">Amount (NGN)<input type="number" min="0" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} className="mt-1 block w-40 rounded-lg border p-2" placeholder={type==='monthly'?'50000':'15000'}/></label>
      <label className="text-xs font-semibold">Effective month<input type="month" required value={month} onChange={e=>setMonth(e.target.value)} className="mt-1 block rounded-lg border p-2"/></label>
      <button type="submit" disabled={saving} className="rounded-lg bg-[#C62839] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving?'Saving…':'Create fee rate'}</button>
    </form>
    {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
    {notice&&<p role="status" className="text-sm text-emerald-700">{notice}</p>}
    {loading?<p className="text-sm">Loading rates…</p>:rates.length===0?<p className="text-sm text-slate-500">No configured rates found.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b"><th className="p-2">Programme</th><th className="p-2">Amount</th><th className="p-2">Effective month</th></tr></thead><tbody>{rates.map(rate=><tr key={rate.id} className="border-b"><td className="p-2 font-bold">{rate.programme_code}</td><td className="p-2">{currency(type==='monthly'?rate.monthly_amount_ngn??0:rate.amount_ngn??0)}</td><td className="p-2">{rate.effective_month}</td></tr>)}</tbody></table></div>}
  </section>;
}
