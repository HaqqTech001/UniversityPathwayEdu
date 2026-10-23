// Only UPEC-owned sample questions can be restored. Provider questions are never cached.
import {CBT_QUESTION_BANK} from './cbtQuestionBank.ts';
const KEY='upec.original-cbt-session.v2';
const storageKey=owner=>KEY+':'+owner;
const originals=new Map(CBT_QUESTION_BANK.map(q=>[q.id,q]));
function valid(session,owner){
 if(typeof owner!=='string'||!owner.trim()||session?.owner!==owner)return false;
 if(!session||session.source!=='sample'||!['timed','untimed','speed'].includes(session.practiceMode))return false;
 if(!Array.isArray(session.questions)||!session.questions.length||session.questions.length>CBT_QUESTION_BANK.length)return false;
 if(!Array.isArray(session.selectedSubjects)||!Array.isArray(session.flagged)||!session.answers||typeof session.answers!=='object'||Array.isArray(session.answers))return false;
 if(!session.questions.every(q=>q!==null&&typeof q==='object'&&typeof q.id==='string'&&typeof q.subject==='string'))return false;
 if(!Number.isInteger(session.currentQuestionIndex)||session.currentQuestionIndex<0||session.currentQuestionIndex>=session.questions.length)return false;
 if(!session.selectedSubjects.length||!session.selectedSubjects.every(subject=>typeof subject==='string'&&subject.trim()))return false;
 if(new Set(session.selectedSubjects).size!==session.selectedSubjects.length)return false;
 if(!session.questions.every(question=>session.selectedSubjects.includes(question.subject)))return false;
 if(typeof session.activeSubject!=='string'||!session.selectedSubjects.includes(session.activeSubject))return false;
 // Question navigation is indexed within the active subject, not the whole paper.
 const activeCount=session.questions.filter(q=>q?.subject===session.activeSubject).length;
 if(!activeCount||session.currentQuestionIndex>=activeCount)return false;
 if(session.deadline!==null&&(!Number.isFinite(session.deadline)||session.deadline<=Date.now()||session.deadline>Date.now()+86400000))return false;
 if(session.practiceMode!=='untimed'&&session.deadline===null)return false;
 if(session.practiceMode==='untimed'&&session.deadline!==null)return false;
 if(!Number.isInteger(session.durationMinutes)||session.durationMinutes<1||session.durationMinutes>1440)return false;
 const ids=new Set();
 for(const q of session.questions){
  const original=originals.get(q.id);
  if(!original||ids.has(q.id)||q.subject!==original.subject||q.topic!==original.topic||q.prompt!==original.prompt||q.passage!==original.passage||q.explanation!==original.explanation||!Array.isArray(q.options)||q.options.length!==original.options.length||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)return false;
  if(q.options.some(option=>typeof option!=='string')||[...q.options].sort().join('\u0000')!==[...original.options].sort().join('\u0000')||q.options[q.answer]!==original.options[original.answer])return false;
  ids.add(q.id);
 }
 const byId=new Map(session.questions.map(q=>[q.id,q]));
 for(const [id,answer] of Object.entries(session.answers)){
  const q=byId.get(id);
  if(!q||!Number.isInteger(answer)||answer<0||answer>=q.options.length)return false;
 }
 return session.flagged.every(id=>typeof id==='string'&&ids.has(id))&&new Set(session.flagged).size===session.flagged.length;
}
export function saveSampleSession(session,owner){
 if(!valid(session,owner))return false;
 try{localStorage.setItem(storageKey(owner),JSON.stringify(session));return true;}catch{return false;}
}
export function loadSampleSession(owner){
 if(!owner)return null;
 try{const value=JSON.parse(localStorage.getItem(storageKey(owner))||'null');
  if(!valid(value,owner)){clearSampleSession(owner);return null;}
  return value;
 }catch{clearSampleSession(owner);return null;}
}
export function clearSampleSession(owner){if(!owner)return;try{localStorage.removeItem(storageKey(owner));}catch{}}
