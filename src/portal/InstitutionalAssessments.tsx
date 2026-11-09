import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {AlertCircle,ArrowLeft,ArrowRight,Check,CheckCircle2,Clock,Flag,Loader2,Save,Send,ShieldCheck,X} from 'lucide-react';
import {getStudentToken} from '../context/AuthContext';
import {upecAuthApi} from '../lib/upecAuthApi';

type Exam={id:string;title:string;duration_minutes:number};
type Question={id:string;prompt:string;options:Record<string,string>};
type HistoryItem={id:string;assessment_id:string;title:string;submitted_at:string;score:number|null;total_questions:number|null;scorePending?:boolean;correctionsAvailable:boolean;correctionsMessage:string};
type CorrectionReview={title:string;score:number;totalQuestions:number;questions:Array<{id:string;prompt:string;options:Record<string,string>;selectedAnswer:string|null;correctAnswer:string;isCorrect:boolean;explanation:string;solutionSteps?:string;topic?:string;subtopic?:string;difficulty?:string;examType?:string;examYear?:number|null}>};
type Result={score:number|null;totalQuestions:number|null;scorePending?:boolean};
type SaveState='saved'|'saving'|'unsaved';

export default function InstitutionalAssessments(){
 const [history,setHistory]=useState<HistoryItem[]>([]);
 const [exams,setExams]=useState<Exam[]>([]);
 const [attempt,setAttempt]=useState('');
 const [activeExam,setActiveExam]=useState<Exam|null>(null);
 const [questions,setQuestions]=useState<Question[]>([]);
 const [expires,setExpires]=useState('');
 const [answers,setAnswers]=useState<Record<string,string>>({});
 const [result,setResult]=useState<Result|null>(null);
 const [correctionReview,setCorrectionReview]=useState<CorrectionReview|null>(null);
 const [correctionLoading,setCorrectionLoading]=useState(false);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [seconds,setSeconds]=useState(0);
 const [currentIndex,setCurrentIndex]=useState(0);
 const [flagged,setFlagged]=useState<string[]>([]);
 const [saveState,setSaveState]=useState<SaveState>('saved');
 const [lastSaved,setLastSaved]=useState('');
 const [confirmSubmit,setConfirmSubmit]=useState(false);
 const hydrated=useRef(false);
 const token=()=>{const value=getStudentToken();if(!value)throw Error('Please sign in again.');return value;};
 const refreshHistory=useCallback(async()=>{const value=token();const [r,e]=await Promise.all([upecAuthApi.assessmentResults(value),upecAuthApi.studentAssessments(value)]);setHistory(r.results);setExams(e.assessments);},[]);

 useEffect(()=>{let cancelled=false;setLoading(true);refreshHistory().catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:'Unable to load examinations.');}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[refreshHistory]);

 useEffect(()=>{if(!expires||result||!attempt)return;const tick=()=>setSeconds(Math.max(0,Math.ceil((Date.parse(expires)-Date.now())/1000)));tick();const timer=window.setInterval(tick,1000);return()=>window.clearInterval(timer);},[expires,result,attempt]);

 useEffect(()=>{
  if(!attempt||!hydrated.current||!expires||result)return;
  setSaveState('saving');
  const timer=window.setTimeout(async()=>{
   try{const response=await upecAuthApi.saveAssessmentAnswers(token(),attempt,answers);setSaveState('saved');setLastSaved(response.savedAt);}
   catch(e){setSaveState('unsaved');setError(e instanceof Error?e.message:'Answers could not be saved. Keep this page open and retry.');}
  },650);
  return()=>window.clearTimeout(timer);
 },[answers,attempt,expires,result]);

 useEffect(()=>{
  if(!attempt||!expires||result||!hydrated.current)return;
  const sendHeartbeat=async()=>{
   try{await upecAuthApi.assessmentTelemetry(token(),attempt,currentIndex);}catch{}
  };
  const onVisibilityChange=()=>{
   if(document.visibilityState==='hidden'){
    try{void upecAuthApi.assessmentTelemetry(token(),attempt,currentIndex,'tab-focus-lost').catch(()=>{});}catch{}
   }else void sendHeartbeat();
  };
  sendHeartbeat();
  const heartbeat=window.setInterval(sendHeartbeat,15000);
  document.addEventListener('visibilitychange',onVisibilityChange);
  return()=>{
   window.clearInterval(heartbeat);
   document.removeEventListener('visibilitychange',onVisibilityChange);
  };
 },[attempt,expires,result,currentIndex]);

 useEffect(()=>{
  if(!attempt||!expires||seconds!==0||result)return;
  let cancelled=false;
  upecAuthApi.assessmentAttempt(token(),attempt).catch(e=>{
   if(cancelled)return;
   setError(e instanceof Error?e.message:'The examination has expired. Your attempt has been finalised.');
   setQuestions([]);
   setAttempt('');
   setActiveExam(null);
   setExpires('');
   setAnswers({});
   hydrated.current=false;
   void refreshHistory().catch(()=>{});
  });
  return()=>{cancelled=true;};
 },[seconds,attempt,expires,result,refreshHistory]);

 const answeredCount=useMemo(()=>questions.filter(q=>Boolean(answers[q.id])).length,[questions,answers]);
 const current=questions[currentIndex];

 const open=async(exam:Exam)=>{
  setBusy(true);setError('');setResult(null);setCorrectionReview(null);setSaveState('saved');setLastSaved('');hydrated.current=false;
  try{
   const value=token();const started=await upecAuthApi.startAssessment(value,exam.id);const details=await upecAuthApi.assessmentAttempt(value,started.attemptId);
   setActiveExam(exam);setAttempt(started.attemptId);setQuestions(details.questions||[]);setExpires(details.attempt.expiresAt||'');setAnswers(details.attempt.answers||{});setCurrentIndex(0);setFlagged([]);hydrated.current=true;
   if(details.attempt.submittedAt){setResult({score:details.attempt.score??null,totalQuestions:details.attempt.totalQuestions??null,scorePending:Boolean(details.attempt.scorePending)});setQuestions([]);setExpires('');}
  }catch(e){setError(e instanceof Error?e.message:'Unable to open this assessment.');}
  finally{setBusy(false);}
 };

 const chooseAnswer=(questionId:string,choice:string)=>{setAnswers(prev=>({...prev,[questionId]:choice}));setError('');};
 const toggleFlag=(id:string)=>setFlagged(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

 const submit=async()=>{
  if(!attempt||!expires||Date.now()>=Date.parse(expires)){setError('The examination time has expired.');return;}
  setBusy(true);setError('');
  try{
   await upecAuthApi.saveAssessmentAnswers(token(),attempt,answers);
   const response=await upecAuthApi.submitAssessment(token(),attempt,answers);
   setResult(response.result);setQuestions([]);setExpires('');setConfirmSubmit(false);setSaveState('saved');hydrated.current=false;
   await refreshHistory();
  }catch(e){setError(e instanceof Error?e.message:'Submission failed. Your answers have not been confirmed as submitted.');}
  finally{setBusy(false);}
 };

 const leaveAttempt=()=>{setAttempt('');setActiveExam(null);setQuestions([]);setExpires('');setAnswers({});setResult(null);setCorrectionReview(null);setError('');hydrated.current=false;void refreshHistory().catch(()=>{});};
 const openCorrections=async(id:string)=>{setCorrectionLoading(true);setError('');try{const data=await upecAuthApi.assessmentCorrections(token(),id);setCorrectionReview(data);}catch(e){setError(e instanceof Error?e.message:'Corrections are not available yet.');}finally{setCorrectionLoading(false);}};
 const formatTime=(value:number)=>`${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`;

 return <section className="mt-5 space-y-5" aria-labelledby="institutional-tests">
  <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
   <div><h3 id="institutional-tests" className="text-lg font-bold tracking-tight text-[#111a43]">Institutional assessments</h3><p className="mt-1 text-sm text-slate-500">Examinations assigned and managed by your academic team.</p></div>
   {!attempt&&!result&&!correctionReview&&<button type="button" onClick={()=>{setLoading(true);refreshHistory().catch(e=>setError(e.message)).finally(()=>setLoading(false));}} className="self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Refresh</button>}
  </header>

  {error&&<div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0"/><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={()=>setError('')} className="ml-auto"><X size={16}/></button></div>}

  {correctionReview&&<div className="space-y-5">
   <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4"><div><button type="button" onClick={()=>setCorrectionReview(null)} className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#111a43]"><ArrowLeft size={13}/> Back to results</button><h4 className="text-lg font-bold text-[#111a43]">{correctionReview.title} — Corrections</h4><p className="mt-1 text-sm text-slate-500">Review each question alongside your answer and the correct answer.</p></div><p className="text-right text-xl font-black tabular-nums text-[#111a43]">{correctionReview.score}/{correctionReview.totalQuestions}</p></div>
   <div className="space-y-4">{correctionReview.questions.map((q,index)=><article key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Question {index+1}</p><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${q.isCorrect?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700'}`}>{q.isCorrect?'Correct':'Incorrect'}</span></div><p className="mt-3 whitespace-pre-wrap font-semibold leading-relaxed text-[#111a43]">{q.prompt}</p><div className="mt-4 space-y-2">{Object.entries(q.options).map(([key,value])=><div key={key} className={`rounded-lg border p-3 text-sm ${key===q.correctAnswer?'border-emerald-300 bg-emerald-50':key===q.selectedAnswer?'border-rose-200 bg-rose-50':'border-slate-100 bg-slate-50'}`}><span className="mr-2 font-bold">{key}.</span>{value}{key===q.correctAnswer&&<span className="ml-2 text-xs font-bold text-emerald-700">Correct answer</span>}{key===q.selectedAnswer&&<span className="ml-2 text-xs font-bold text-slate-600">Your answer</span>}</div>)}</div>{q.explanation&&<div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Explanation</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{q.explanation}</p></div>}{q.solutionSteps&&<div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-900">Worked solution</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{q.solutionSteps}</p></div>}</article>)}</div>
  </div>}

  {result&&<div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
   <div className="flex items-center gap-2 text-emerald-800"><CheckCircle2 size={20}/><h4 className="font-bold">Assessment submitted</h4></div>
   {result.scorePending||result.score===null?<p className="mt-2 text-base font-semibold text-amber-800">Your score is being withheld until the examination closes.</p>:<p className="mt-2 text-3xl font-black tracking-tight text-[#111a43]">{result.score}<span className="text-lg font-semibold text-slate-400"> / {result.totalQuestions}</span></p>}
   <p className="mt-1 text-sm text-slate-600">Your submission has been recorded successfully.</p>
   <button type="button" onClick={leaveAttempt} className="mt-4 rounded-lg bg-[#111a43] px-4 py-2.5 text-sm font-semibold text-white">Back to assessments</button>
  </div>}

  {!attempt&&!result&&!correctionReview&&<div className="space-y-6">
   <div className="space-y-3">
    <div className="flex items-center justify-between"><h4 className="text-sm font-bold text-[#111a43]">Available examinations</h4><span className="text-xs text-slate-400">{exams.length} available</span></div>
    {loading?<div className="rounded-xl border border-slate-200 p-5 text-sm text-slate-500">Loading available assessments…</div>:exams.length===0?<div className="rounded-xl border border-dashed border-slate-300 p-6 text-center"><p className="text-sm font-semibold text-slate-700">No examinations available</p><p className="mt-1 text-xs text-slate-500">When your academic team publishes an assessment for you, it will appear here.</p></div>:<div className="grid gap-3 md:grid-cols-2">{exams.map(exam=><article key={exam.id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
     <div><p className="font-semibold text-[#111a43]">{exam.title}</p><div className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Clock size={14}/>{exam.duration_minutes} minutes</div></div>
     <button type="button" disabled={busy} onClick={()=>void open(exam)} className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#c62839] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#a91f30] disabled:opacity-50">{busy?<Loader2 size={15} className="animate-spin"/>:'Start examination'}<ArrowRight size={15}/></button>
    </article>)}</div>}
   </div>
   <div className="space-y-3 border-t border-slate-200 pt-5">
    <h4 className="text-sm font-bold text-[#111a43]">Previous results</h4>
    {history.length===0?<p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Your submitted examination results will appear here.</p>:<div className="divide-y divide-slate-100 rounded-xl border border-slate-200">{history.map(item=><div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#111a43]">{item.title||'Institutional assessment'}</p><p className="mt-0.5 text-xs text-slate-500">{new Date(item.submitted_at).toLocaleString()}</p></div><div className="flex shrink-0 items-center gap-3"><div className="text-right"><p className="font-bold tabular-nums text-[#111a43]">{item.scorePending||item.score===null?'Pending release':item.score+'/'+(item.total_questions??'—')}</p><p className="text-[11px] text-slate-400">Score</p></div>{item.correctionsAvailable?<button type="button" disabled={correctionLoading} onClick={()=>void openCorrections(item.id)} className="rounded-lg bg-[#111a43] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{correctionLoading?'Loading…':'Review corrections'}</button>:<span className="max-w-36 text-right text-[11px] text-slate-400">{item.correctionsMessage||'Corrections pending'}</span>}</div></div>)}</div>}
   </div>
  </div>}

  {attempt&&!result&&<div className="space-y-4">
   <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
    <div className="min-w-0"><button type="button" onClick={()=>setError('Use Submit examination to finish and record your attempt. Leaving now will not submit it.')} className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#111a43]"><ArrowLeft size={13}/> Assessment in progress</button><h4 className="truncate font-bold text-[#111a43]">{activeExam?.title||'Institutional assessment'}</h4><p className="mt-1 text-xs text-slate-500">{answeredCount} of {questions.length} answered</p></div>
    <div className={`rounded-xl px-3 py-2 text-right ${seconds<=300?'bg-rose-50 text-rose-700':'bg-[#111a43] text-white'}`}><p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">Time remaining</p><p role="timer" aria-live="off" className="font-mono text-xl font-bold tabular-nums">{formatTime(seconds)}</p></div>
   </div>

   <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
    <div className="inline-flex items-center gap-1.5 text-slate-500">{saveState==='saving'?<Loader2 size={14} className="animate-spin"/>:saveState==='saved'?<Check size={14} className="text-emerald-600"/>:<AlertCircle size={14} className="text-rose-600"/>}{saveState==='saving'?'Saving answers…':saveState==='saved'?'All changes saved':'Answers not saved — retry by changing an answer'}{lastSaved&&saveState==='saved'&&<span className="text-slate-400">· {new Date(lastSaved).toLocaleTimeString()}</span>}</div>
    <span className="text-slate-400">{currentIndex+1} / {questions.length}</span>
   </div>

   <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
     {current?<><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Question {currentIndex+1}</p><button type="button" onClick={()=>toggleFlag(current.id)} aria-pressed={flagged.includes(current.id)} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${flagged.includes(current.id)?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-600'}`}><Flag size={13}/>{flagged.includes(current.id)?'Flagged':'Flag'}</button></div>
      <p className="mt-4 whitespace-pre-wrap text-base font-semibold leading-relaxed text-[#111a43]">{current.prompt}</p>
      <div className="mt-5 space-y-2.5">{Object.entries(current.options).map(([key,value])=><label key={key} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${answers[current.id]===key?'border-[#111a43] bg-slate-50 ring-1 ring-[#111a43]/10':'border-slate-200 hover:border-slate-300'}`}><input type="radio" name={'assessment-'+current.id} value={key} checked={answers[current.id]===key} onChange={()=>chooseAnswer(current.id,key)} className="mt-0.5 accent-[#111a43]"/><span className="flex min-w-0 gap-2 text-sm text-slate-700"><strong className="text-[#111a43]">{key}.</strong><span>{value}</span></span></label>)}</div>
      <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4"><button type="button" disabled={currentIndex===0} onClick={()=>setCurrentIndex(i=>Math.max(0,i-1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"><ArrowLeft size={15}/> Previous</button><button type="button" disabled={currentIndex>=questions.length-1} onClick={()=>setCurrentIndex(i=>Math.min(questions.length-1,i+1))} className="inline-flex items-center gap-1 rounded-lg bg-[#111a43] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Next <ArrowRight size={15}/></button></div>
     </>:<p className="py-10 text-center text-sm text-slate-500">No questions are available for this attempt.</p>}
    </div>
    <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-4">
     <div className="flex items-center justify-between"><h5 className="text-xs font-bold uppercase tracking-wide text-slate-600">Question navigator</h5><span className="text-[11px] text-slate-400">{answeredCount}/{questions.length}</span></div>
     <div className="mt-3 grid grid-cols-5 gap-2">{questions.map((q,index)=><button key={q.id} type="button" onClick={()=>setCurrentIndex(index)} aria-label={`Go to question ${index+1}`} aria-current={currentIndex===index?'step':undefined} className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-bold ${currentIndex===index?'bg-[#111a43] text-white ring-2 ring-[#111a43]/20':answers[q.id]?'bg-emerald-100 text-emerald-800': 'bg-white text-slate-600 border border-slate-200'}`}>{index+1}{flagged.includes(q.id)&&<span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-slate-50"/>}</button>)}</div>
     <div className="mt-3 space-y-1.5 text-[11px] text-slate-500"><p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-200"/>Answered</p><p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm border border-slate-300 bg-white"/>Unanswered</p><p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500"/>Flagged</p></div>
     <div className="mt-4 border-t border-slate-200 pt-3"><button type="button" disabled={busy||seconds===0||!questions.length} onClick={()=>setConfirmSubmit(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c62839] px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Send size={14}/> Submit examination</button><p className="mt-2 text-center text-[10px] leading-relaxed text-slate-400">Your answers are saved automatically while you work.</p></div>
    </aside>
   </div>
   {confirmSubmit&&<div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-assessment-submit"><div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"><h5 id="confirm-assessment-submit" className="font-bold text-[#111a43]">Submit this examination?</h5><p className="mt-2 text-sm leading-relaxed text-slate-600">You have answered {answeredCount} of {questions.length} questions. Unanswered questions will remain blank. You cannot change your answers after submission.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={()=>setConfirmSubmit(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">Continue exam</button><button type="button" disabled={busy||saveState==='unsaved'} onClick={()=>void submit()} className="rounded-lg bg-[#c62839] px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{busy?'Submitting…':'Confirm submission'}</button></div></div></div>}
  </div>}
 </section>;
}
