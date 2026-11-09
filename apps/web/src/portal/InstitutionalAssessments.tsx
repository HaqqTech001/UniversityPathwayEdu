import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import {upecAuthApi} from '../lib/upecAuthApi';
type Exam={id:string;title:string;duration_minutes:number};
type Question={id:string;prompt:string;options:Record<string,string>};
export default function InstitutionalAssessments(){
 const [history,setHistory]=useState<Array<{id:string;assessment_id:string;submitted_at:string;score:number|null;total_questions:number|null;scorePending?:boolean}>>([]);
 const [exams,setExams]=useState<Exam[]>([]),[attempt,setAttempt]=useState(''),[questions,setQuestions]=useState<Question[]>([]),[expires,setExpires]=useState(''),[answers,setAnswers]=useState<Record<string,string>>({}),[result,setResult]=useState<{score:number|null;totalQuestions:number|null;scorePending?:boolean}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[seconds,setSeconds]=useState(0);
 const token=()=>{const value=getStudentToken();if(!value)throw Error('Please sign in again.');return value;};
 useEffect(()=>{const key=getStudentToken();if(!key)return;Promise.all([upecAuthApi.studentAssessments(key),upecAuthApi.assessmentResults(key)]).then(([a,b])=>{setExams(a.assessments);setHistory(b.results);}).catch(e=>setError(e.message));},[]);
 useEffect(()=>{if(!expires)return;const tick=()=>setSeconds(Math.max(0,Math.ceil((new Date(expires).getTime()-Date.now())/1000)));tick();const timer=setInterval(tick,1000);return()=>clearInterval(timer);},[expires]);
 useEffect(()=>{
  if(!attempt||!expires||result||seconds!==0)return;
  let cancelled=false;
  const timer=window.setTimeout(async()=>{
   try{
    const response=await upecAuthApi.assessmentResults(token());
    if(cancelled)return;
    setHistory(response.results);
    const completed=response.results.find(item=>item.id===attempt);
    if(completed)setResult({score:completed.score??null,totalQuestions:completed.total_questions??null,scorePending:Boolean(completed.scorePending)});
    else setError('Your examination time has ended. The system is finalising the attempt; refresh your results shortly.');
    setQuestions([]);
    setExpires('');
   }catch(e){if(!cancelled)setError(e instanceof Error?e.message:'The expired attempt could not be finalised yet.');}
  },35000);
  return()=>{cancelled=true;window.clearTimeout(timer);};
 },[attempt,expires,result,seconds]);
 useEffect(()=>{
  if(!attempt||!expires||result)return;
  const timer=window.setTimeout(()=>{try{void upecAuthApi.saveAssessmentAnswers(token(),attempt,answers).catch(e=>setError(e instanceof Error?e.message:'Answers could not be saved.'));}catch(e){setError(e instanceof Error?e.message:'Please sign in again to save your answers.');}},650);
  return()=>window.clearTimeout(timer);
 },[attempt,expires,result,answers]);
 useEffect(()=>{
  if(!attempt||!expires||result)return;
  const heartbeat=()=>{try{void upecAuthApi.assessmentTelemetry(token(),attempt).catch(()=>{});}catch{}};
  const onVisibilityChange=()=>{if(document.visibilityState==='hidden'){try{void upecAuthApi.assessmentTelemetry(token(),attempt,undefined,'tab-focus-lost').catch(()=>{});}catch{}}else heartbeat();};
  heartbeat();
  const interval=window.setInterval(heartbeat,15000);
  document.addEventListener('visibilitychange',onVisibilityChange);
  return()=>{window.clearInterval(interval);document.removeEventListener('visibilitychange',onVisibilityChange);};
 },[attempt,expires,result]);
 const open=async(id:string)=>{setBusy(true);setError('');try{const started=await upecAuthApi.startAssessment(token(),id);const details=await upecAuthApi.assessmentAttempt(token(),started.attemptId);setAttempt(started.attemptId);setQuestions(details.questions||[]);setExpires(details.attempt.expiresAt||'');setAnswers(details.attempt.answers||{});setResult(details.attempt.submittedAt?{score:details.attempt.score??null,totalQuestions:details.attempt.totalQuestions??null,scorePending:Boolean(details.attempt.scorePending)}:null);}catch(e){setError(e instanceof Error?e.message:'Unable to start assessment.');}finally{setBusy(false);}};
 const submit=async()=>{if(!expires||Date.now()>=Date.parse(expires)){setError('The examination time has expired. Submission is no longer available.');return;}setBusy(true);setError('');try{await upecAuthApi.saveAssessmentAnswers(token(),attempt,answers);const response=await upecAuthApi.submitAssessment(token(),attempt,answers);setResult(response.result);setQuestions([]);setExpires('');void upecAuthApi.assessmentResults(token()).then(r=>setHistory(r.results)).catch(()=>{});}catch(e){setError(e instanceof Error?e.message:'Submission failed.');}finally{setBusy(false);}};
 return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="institutional-tests"><h3 id="institutional-tests" className="text-lg font-bold text-[#111a43]">University Pathway Institutional Assessments</h3><p className="mt-2 text-sm text-slate-600">Teacher-authored assessments are separate from JAMB historical practice.</p>
 {error&&<p role="alert" className="my-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
 {result&&<div role="status" className="my-4 rounded-lg bg-emerald-50 p-4 text-emerald-800"><p className="font-semibold">Assessment submitted successfully.</p><p className="mt-1">{result.scorePending||result.score===null?'Your score is being withheld until the examination closes.':'Score: '+result.score+' / '+result.totalQuestions+'.'}</p><button type="button" onClick={()=>{setAttempt('');setResult(null);}} className="mt-3 rounded-lg bg-[#111a43] px-4 py-2 text-sm font-semibold text-white">Back to assessments</button></div>}
 {!attempt&&<div className="mt-4 space-y-3">{exams.length===0?<p className="text-sm text-slate-500">No published assessments currently available.</p>:exams.map(e=><div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"><span className="font-semibold">{e.title} · {e.duration_minutes} minutes</span><button disabled={busy} type="button" onClick={()=>void open(e.id)} className="rounded-lg bg-[#c62839] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Start / Resume</button></div>)}</div>}
 {attempt&&!result&&seconds===0&&<p role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Time has expired. This attempt can no longer be submitted. Contact your examination administrator if you need assistance.</p>}
 {attempt&&!result&&seconds>0&&<div className="mt-5"><p className="rounded-lg bg-[#111a43] p-3 text-sm font-semibold text-white" role="timer">Time remaining: {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</p><ol className="mt-5 space-y-6">{questions.map((q,i)=><li key={q.id} className="rounded-xl border border-slate-200 p-4"><p className="mb-3 font-semibold">{i+1}. {q.prompt}</p><div className="space-y-2">{Object.entries(q.options).map(([key,value])=><label className="flex cursor-pointer gap-3 rounded-lg border border-slate-100 p-3 text-sm" key={key}><input type="radio" name={'assessment-'+q.id} checked={answers[q.id]===key} onChange={()=>setAnswers(a=>({...a,[q.id]:key}))}/><span>{key}. {value}</span></label>)}</div></li>)}</ol><button disabled={busy||seconds===0} onClick={()=>void submit()} type="button" className="mt-6 rounded-lg bg-[#c62839] px-5 py-3 font-bold text-white disabled:opacity-50">Submit examination</button></div>}
  <div className="mt-8 border-t border-slate-200 pt-6"><h4 className="font-bold text-[#111a43]">My previous results</h4>{history.length===0?<p className="mt-2 text-sm text-slate-500">No submitted assessments yet.</p>:<ul className="mt-3 space-y-2">{history.map(h=><li className="rounded-lg border border-slate-200 p-3 text-sm" key={h.id}>{new Date(h.submitted_at).toLocaleDateString()} · Score: <strong>{h.scorePending||h.score===null?'Pending release':h.score+'/'+(h.total_questions??'—')}</strong></li>)}</ul>}</div>
 </section>;
}
