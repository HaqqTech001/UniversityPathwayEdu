import React,{useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import {upecAuthApi} from '../lib/upecAuthApi';

type RawQuestion={id:string;text?:string;questionHtml?:string;options?:Record<string,string>;correctAnswer?:string;year?:number};
// Match the UPEC backend allowlist. Each subject/year still depends on actual provider availability.
const subjects=[
 ['english','Use of English'],['mathematics','Mathematics'],['physics','Physics'],
 ['chemistry','Chemistry'],['biology','Biology'],['government','Government'],
 ['economics','Economics'],['literature-in-english','Literature in English'],
 ['commerce','Commerce'],['accounting','Principles of Accounts'],
 ['geography','Geography'],['history','History'],
 ['crs','Christian Religious Studies'],['irs','Islamic Religious Studies'],
 ['agricultural-science','Agricultural Science']
] as const;
const plain=(text:string)=>text.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();
export default function JambPastQuestions(){
 const [subject,setSubject]=useState('mathematics');
 const [year,setYear]=useState(2025);
 const [questions,setQuestions]=useState<RawQuestion[]>([]);
 const [answers,setAnswers]=useState<Record<string,string>>({});
 const [revealed,setRevealed]=useState<Record<string,boolean>>({});
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [loaded,setLoaded]=useState(false);
 const [nextCursor,setNextCursor]=useState<string|null>(null);
 const [availableYears,setAvailableYears]=useState<number[]>([]);
 const [catalogueWarning,setCatalogueWarning]=useState('');
 const [providerStatus,setProviderStatus]=useState<'checking'|'ready'|'unconfigured'|'unavailable'>('checking');
 useEffect(()=>{let active=true;const token=getStudentToken();if(!token){setProviderStatus('unavailable');return;}const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');fetch(base+'/api/student/practice/utme/provider-status',{headers:{Authorization:'Bearer '+token}}).then(async r=>{if(!r.ok)throw Error('Cannot check provider');return r.json()}).then(result=>{if(active)setProviderStatus(result.configured?'ready':'unconfigured')}).catch(()=>{if(active)setProviderStatus('unavailable')});return()=>{active=false}},[]);
 useEffect(()=>{let current=true;const token=getStudentToken();if(!token)return;const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');fetch(base+'/api/student/practice/utme/subjects/'+encodeURIComponent(subject)+'/years',{headers:{Authorization:'Bearer '+token}}).then(async r=>{if(!r.ok)throw Error('Provider year catalogue unavailable');return r.json()}).then(result=>{if(!current)return;const years=(Array.isArray(result.years)?result.years:[]).filter((row:any)=>row?.examTypes?.includes('jamb')||Number(row?.breakdown?.jamb)>0).map((row:any)=>Number(row.year)).filter((value:number)=>Number.isInteger(value)).sort((a:number,b:number)=>b-a);setAvailableYears(years);if(years.length)setYear(years[0]);setCatalogueWarning(years.length?'':'No JAMB question years confirmed for this subject by the provider.');}).catch(()=>{if(current){setAvailableYears([]);setCatalogueWarning('Unable to check provider year coverage. Availability is not confirmed.');}});return()=>{current=false;};},[subject]);
 const fetchQuestions=async(event:React.FormEvent)=>{
  event.preventDefault();setLoading(true);setError('');setQuestions([]);setAnswers({});setRevealed({});setLoaded(false);setNextCursor(null);
  try{
   const token=getStudentToken();
   if(!token)throw new Error('Sign in again to access past questions.');
   const result=await upecAuthApi.utmePracticeQuestions(token,subject,year);
   if(!Array.isArray(result.questions))throw new Error('Unexpected response from the question provider.');
   setQuestions(result.questions);
   setNextCursor(typeof result.pagination?.nextCursor==='string'?result.pagination.nextCursor:null);
   setLoaded(true);
  }catch(err){setError(err instanceof Error?err.message:'Unable to fetch questions.');}
  finally{setLoading(false);}
 };
 const loadMore=async()=>{
  const token=getStudentToken();
  if(!token||!nextCursor)return;
  setLoading(true);setError('');
  try{
   const result=await upecAuthApi.utmePracticeQuestions(token,subject,year,nextCursor);
   if(!Array.isArray(result.questions))throw Error('Unexpected provider response.');
   setQuestions(previous=>[...previous,...result.questions.filter((item:any)=>!previous.some(q=>q.id===item.id))]);
   setNextCursor(typeof result.pagination?.nextCursor==='string'?result.pagination.nextCursor:null);
  }catch(err){setError(err instanceof Error?err.message:'Unable to load more questions.');}
  finally{setLoading(false);}
 };
 return <section aria-labelledby="past-questions-title" className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
  <div><h3 id="past-questions-title" className="font-serif text-lg font-bold text-[#111a43]">Historical JAMB past questions</h3><p className="mt-2 text-xs leading-6 text-slate-600">Third-party historical JAMB question bank. Choose any listed UTME subject and a year; availability depends on the provider's verified subject/year coverage. Available examination years are fetched for each subject from the provider. Do not assume a year has questions until its coverage is confirmed. This is separate from the official examination. Answers are revealed only when you choose to check your response.</p></div>
  <div role="status" className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-[#111A43]">{providerStatus==='ready'?'ALOC API key configured · Live question availability still requires a successful request.':providerStatus==='checking'?'Checking historical question provider…':providerStatus==='unconfigured'?'ALOC API key is not configured on the backend. Historical questions cannot load yet.':'Provider status could not be confirmed. Try again later.'}</div>
  <form onSubmit={fetchQuestions} className="mt-5 flex flex-wrap items-end gap-3">
   <label className="flex min-w-40 flex-1 flex-col gap-2 text-xs font-bold text-[#111a43]">Subject<select value={subject} onChange={e=>setSubject(e.target.value)} className="rounded-xl border border-slate-300 bg-white p-3">{subjects.map(([code,label])=><option value={code} key={code}>{label}</option>)}</select></label>
   <label className="flex min-w-32 flex-1 flex-col gap-2 text-xs font-bold text-[#111a43]">Examination year<select value={year} onChange={e=>setYear(Number(e.target.value))} className="rounded-xl border border-slate-300 bg-white p-3">{(availableYears.length?availableYears:[year]).map(y=><option key={y} value={y}>{y}</option>)}</select></label>
   <button disabled={loading||providerStatus==='unconfigured'} type="submit" className="rounded-xl bg-[#c62839] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{loading?'Loading...':'Load questions'}</button>
  </form>
  {catalogueWarning&&<p className="mt-3 text-xs text-amber-800" role="status">{catalogueWarning}</p>}
  {error&&<p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
  {loaded&&!questions.length&&<p className="mt-4 text-sm text-slate-600">No questions were returned for this subject and year. Try another combination.</p>}
  <ol className="mt-6 space-y-5">{questions.map((q,i)=>{
   const key=q.id||String(i), selected=answers[key],options=Object.entries(q.options||{}),correct=String(q.correctAnswer||'').toLowerCase();
   return <li key={key} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
    <p className="text-sm font-bold leading-7 text-[#111a43]">{i+1}. {plain(q.text||q.questionHtml||'Question text unavailable')}</p>
    <div className="mt-4 space-y-2">{options.map(([letter,value])=><label key={letter} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700"><input type="radio" className="mt-1" name={'jamb-'+key} checked={selected===letter} onChange={()=>{setAnswers(a=>({...a,[key]:letter}));setRevealed(v=>({...v,[key]:false}));}}/><span><strong>{letter.toUpperCase()}.</strong> {plain(String(value))}</span></label>)}</div>
    <button type="button" disabled={!selected} onClick={()=>setRevealed(v=>({...v,[key]:true}))} className="mt-4 rounded-lg bg-[#111a43] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Check answer</button>
    {revealed[key]&&<p role="status" className={'mt-3 rounded-xl p-3 text-sm '+(selected.toLowerCase()===correct?'bg-emerald-50 text-emerald-800':'bg-amber-50 text-amber-900')}>{correct?'Correct option: '+correct.toUpperCase()+' — '+(selected.toLowerCase()===correct?'Well done.':'Review your selection.'):'Answer key unavailable from the provider.'} Detailed worked explanations require additional licensed provider access.</p>}
   </li>;
  })}</ol>
  {nextCursor&&<div className="mt-5 text-center"><button type="button" onClick={()=>void loadMore()} disabled={loading} className="rounded-xl bg-[#111a43] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{loading?'Loading...':'Load more questions'}</button></div>}
  <p className="mt-6 text-xs text-slate-500">Questions supplied by a third-party educational API, not an official JAMB service. <a className="font-semibold text-[#c62839] underline" href="https://aloc.com.ng" target="_blank" rel="noopener noreferrer">Powered by ALOC API</a></p>
 </section>;
}
