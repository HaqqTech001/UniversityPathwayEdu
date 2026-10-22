// Only UPEC-owned sample questions can be restored. Provider questions are never cached.
import {CBT_QUESTION_BANK} from './cbtQuestionBank.js';
const KEY='upec.original-cbt-session.v1';
const originals=new Map(CBT_QUESTION_BANK.map(q=>[q.id,q]));
function valid(session){
 if(!session||session.source!=='sample'||!['timed','untimed','speed'].includes(session.practiceMode))return false;
 if(!Array.isArray(session.questions)||!session.questions.length||session.questions.length>CBT_QUESTION_BANK.length)return false;
 if(!Array.isArray(session.selectedSubjects)||!Array.isArray(session.flagged)||!session.answers||typeof session.answers!=='object')return false;
 if(!Number.isInteger(session.currentQuestionIndex)||session.currentQuestionIndex<0||session.currentQuestionIndex>=session.questions.length)return false;
 if(typeof session.activeSubject!=='string'||!session.selectedSubjects.includes(session.activeSubject))return false;
 if(session.deadline!==null&&(!Number.isFinite(session.deadline)||session.deadline<=Date.now()||session.deadline>Date.now()+86400000))return false;
 if(session.practiceMode!=='untimed'&&session.deadline===null)return false;
 const ids=new Set();
 for(const q of session.questions){
  const original=originals.get(q.id);
  if(!original||ids.has(q.id)||!Array.isArray(q.options)||q.options.length!==original.options.length)return false;
  if(!q.options.every(option=>original.options.includes(option))||q.options[q.answer]!==original.options[original.answer])return false;
  ids.add(q.id);
 }
 for(const [id,answer] of Object.entries(session.answers)){if(!ids.has(id)||!Number.isInteger(answer)||answer<0||answer>3)return false;}
 return session.flagged.every(id=>ids.has(id));
}
export function saveSampleSession(session){
 if(!valid(session))return false;
 try{localStorage.setItem(KEY,JSON.stringify(session));return true;}catch{return false;}
}
export function loadSampleSession(){
 try{const value=JSON.parse(localStorage.getItem(KEY)||'null');
  if(!valid(value)){clearSampleSession();return null;}
  return value;
 }catch{clearSampleSession();return null;}
}
export function clearSampleSession(){try{localStorage.removeItem(KEY);}catch{}}
