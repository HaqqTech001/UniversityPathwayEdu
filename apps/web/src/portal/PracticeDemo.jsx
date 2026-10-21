import React,{useEffect,useState} from 'react';
import {Clock3,Flag,RotateCcw,CheckCircle2,AlertTriangle} from 'lucide-react';
import {practiceQuestions} from './practiceQuestions.js';
import {formatCountdown,gradeAttempt,secondsRemaining} from './practiceEngine.js';

const subjects=[...new Set(practiceQuestions.map(q=>q.subject))];
const DURATION_SECONDS=180;
export default function PracticeDemo(){
 const [subject,setSubject]=useState(subjects[0]);
 const [index,setIndex]=useState(0);
 const [answers,setAnswers]=useState({});
 const [marked,setMarked]=useState([]);
 const [deadline,setDeadline]=useState(null);
 const [now,setNow]=useState(Date.now());
 const [finished,setFinished]=useState(false);
 const [timedOut,setTimedOut]=useState(false);
 const [confirmSubmit,setConfirmSubmit]=useState(false);
 const questions=practiceQuestions.filter(q=>q.subject===subject);
 const q=questions[index];
 const remaining=deadline===null?DURATION_SECONDS:secondsRemaining(deadline,now);
 const result=gradeAttempt(questions,answers);
 useEffect(()=>{
  if(deadline===null||finished)return;
  const tick=()=>setNow(Date.now());
  tick();
  const timer=setInterval(tick,250);
  return ()=>clearInterval(timer);
 },[deadline,finished]);
 useEffect(()=>{if(deadline!==null&&!finished&&remaining===0){setTimedOut(true);setFinished(true)}},[deadline,finished,remaining]);
 function reset(nextSubject=subject){setConfirmSubmit(false);setSubject(nextSubject);setIndex(0);setAnswers({});setMarked([]);setDeadline(null);setNow(Date.now());setFinished(false);setTimedOut(false)}
 function start(){const startAt=Date.now();setNow(startAt);setDeadline(startAt+DURATION_SECONDS*1000)}
 function finish(){setNow(Date.now());setConfirmSubmit(false);setFinished(true)}
 useEffect(()=>{if(!deadline||finished||confirmSubmit)return;const key=e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return;const k=e.key.toUpperCase();if(['A','B','C','D'].includes(k)&&k.charCodeAt(0)-65<(questions[index]?.options.length||0)){setAnswers(prev=>({...prev,[questions[index].id]:k.charCodeAt(0)-65}));}if(e.key==='ArrowRight')setIndex(i=>Math.min(questions.length-1,i+1));if(e.key==='ArrowLeft')setIndex(i=>Math.max(0,i-1));};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[deadline,finished,confirmSubmit,index,questions]);
 const started=deadline!==null;
 const percentage=questions.length?Math.round(result.answered/questions.length*100):0;
 const unanswered=questions.length-result.answered;
 return <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Sample CBT practice">
 <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5 sm:p-7">
  <div><p className="text-xs font-bold uppercase tracking-widest text-crimson">Interactive CBT demonstration</p><h4 className="mt-1 text-xl font-extrabold text-[#111A43]">CBT Practice Centre</h4><p className="mt-1 text-xs text-slate-500">Familiarise yourself with the examination environment</p></div>
  <label className="text-sm font-semibold">Subject <select aria-label="Practice subject" value={subject} onChange={e=>reset(e.target.value)} className="ml-2 max-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2">{subjects.map(s=><option key={s}>{s}</option>)}</select></label>
 </div>
 <div className="p-5 sm:p-7">
  <p className="text-sm leading-6 text-slate-600">Original sample questions only. This practice runs in your browser; no student account, official JAMB question bank or permanent results storage is connected.</p>
  {!started?<div className="mt-7 rounded-2xl bg-cream p-7"><div className="flex items-center gap-2 font-extrabold"><Clock3 size={20} className="text-crimson"/> 3-minute timed practice</div><p className="mt-3 text-sm leading-7 text-slate-600">Answer {questions.length} questions. You can move between questions, mark any for review and submit early. The exercise submits automatically when the timer reaches zero.</p><button type="button" onClick={start} className="mt-6 rounded-xl bg-crimson px-6 py-3 font-bold text-white">Start practice</button></div>:
  finished?<div aria-live="polite" className="mt-6"><div className="rounded-2xl bg-cream p-6"><p className="text-xs font-bold uppercase tracking-wider text-crimson">{timedOut?'Time expired — submitted automatically':'Practice completed'}</p><h5 className="mt-2 text-3xl font-extrabold">{result.correct} / {result.total} correct</h5><p className="mt-2 text-sm text-slate-600">{result.answered} answered · {result.total-result.answered} unanswered · {Math.round(result.correct/result.total*100)}% score</p></div><h5 className="mt-8 text-xl font-extrabold">Review your answers</h5><div className="mt-4 space-y-4">{questions.map((item,i)=><article key={item.id} className="rounded-xl border border-slate-200 p-5"><p className="font-bold">{i+1}. {item.prompt}</p><p className="mt-3 text-sm">Your answer: {answers[item.id]===undefined?'Not answered':item.options[answers[item.id]]}</p><p className="mt-1 text-sm font-semibold text-navy">Correct answer: {item.options[item.answer]}</p><p className="mt-2 text-sm leading-6 text-slate-600">{item.explanation}</p></article>)}</div><button type="button" onClick={()=>reset()} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-crimson px-6 py-3 font-bold text-white"><RotateCcw size={17}/> Practice again</button></div>:
  <div className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-bold">Question {index+1} of {questions.length}</p><div role="timer" aria-label="Time remaining" className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold ${remaining<=30?'bg-red-100 text-red-800':'bg-navy text-white'}`}><Clock3 size={18}/>{formatCountdown(remaining)}</div></div>
   <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3"><div className="rounded-lg bg-cream p-3"><strong>{result.answered}</strong><span className="ml-2 text-slate-600">Answered</span></div><div className="rounded-lg bg-cream p-3"><strong>{questions.length-result.answered}</strong><span className="ml-2 text-slate-600">Remaining</span></div><div className="rounded-lg bg-cream p-3"><strong>{marked.length}</strong><span className="ml-2 text-slate-600">Flagged</span></div></div>
   <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><div className="h-full rounded-full bg-[#111A43] transition-all" style={{width:percentage+'%'}}/></div><p className="mt-2 text-xs text-slate-600">{percentage}% completed · Use the numbered palette to jump between questions.</p>
   <div className="mt-5 rounded-xl border border-slate-200 bg-[#f7f8fc] p-4"><p className="mb-3 text-sm font-bold text-[#111A43]">Question palette</p><div className="flex flex-wrap gap-2" aria-label="Question navigation">{questions.map((item,i)=><button type="button" key={item.id} aria-label={`Go to question ${i+1}${marked.includes(item.id)?', flagged':''}${answers[item.id]!==undefined?', answered':', not answered'}`} aria-current={index===i?'step':undefined} onClick={()=>setIndex(i)} className={`relative h-11 w-11 rounded-lg border text-sm font-bold ${index===i?'border-navy bg-navy text-white':answers[item.id]!==undefined?'border-green-300 bg-green-50 text-green-900':'border-slate-300 bg-white text-navy'}`}>{i+1}{marked.includes(item.id)&&<span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-crimson" aria-hidden="true"/>}</button>)}</div><div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600"><span>■ Current</span><span className="text-green-800">■ Answered</span><span>● Red dot = flagged</span></div></div>
   <div className="mt-7 border-t border-slate-100 pt-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{q.topic}</p><h5 className="mt-3 text-lg font-extrabold text-[#111A43]">{q.prompt}</h5><p className="mt-2 text-xs text-slate-500">Select one option (A–D). Keyboard shortcuts A–D and ← → are available.</p><fieldset className="mt-5 space-y-3"><legend className="sr-only">Choose one answer</legend>{q.options.map((option,i)=><label key={i} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition ${answers[q.id]===i?'border-crimson bg-red-50':'border-slate-200 hover:border-slate-400'}`}><input type="radio" name={q.id} checked={answers[q.id]===i} onChange={()=>setAnswers(prev=>({...prev,[q.id]:i}))} className="accent-red-700"/><span>{String.fromCharCode(65+i)}. {option}</span></label>)}</fieldset>
   <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={()=>setMarked(prev=>prev.includes(q.id)?prev.filter(id=>id!==q.id):[...prev,q.id])} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold"><Flag size={17}/>{marked.includes(q.id)?'Remove flag':'Flag for review'}</button><div className="flex gap-2"><button type="button" disabled={index===0} onClick={()=>setIndex(i=>i-1)} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold disabled:opacity-40">Previous</button><button type="button" disabled={index===questions.length-1} onClick={()=>setIndex(i=>i+1)} className="rounded-lg bg-navy px-4 py-3 text-sm font-bold text-white disabled:opacity-40">Next</button></div></div>
   <div className="mt-7 border-t border-slate-100 pt-6"><p className="mb-3 text-sm text-slate-600">You can submit before the timer ends. Review flagged and unanswered questions first.</p><button type="button" onClick={()=>setConfirmSubmit(true)} className="rounded-xl bg-crimson px-6 py-3 font-bold text-white">Submit practice</button></div>
   </div></div>}
  {started&&!finished&&confirmSubmit&&<div role="dialog" aria-modal="true" aria-labelledby="practice-submit-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center gap-2 text-[#111A43]"><AlertTriangle size={22} className="text-[#c62839]"/><h5 id="practice-submit-title" className="text-xl font-extrabold">Submit your practice?</h5></div><p className="mt-4 text-sm leading-6 text-slate-700">You answered {result.answered} of {questions.length} questions. {unanswered>0?`${unanswered} question${unanswered===1?' is':'s are'} still unanswered. `:''}{marked.length>0?`${marked.length} question${marked.length===1?' is':'s are'} flagged for review. `:''}Submitting ends this attempt.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" autoFocus onClick={()=>setConfirmSubmit(false)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-[#111A43]">Return to questions</button><button type="button" onClick={finish} className="rounded-xl bg-[#c62839] px-5 py-3 text-sm font-bold text-white">Confirm submission</button></div></div></div>}
 </div></section>
}
