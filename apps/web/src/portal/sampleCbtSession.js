// Only UPEC-authored sample CBT papers may be persisted locally.
// Historical questions from external providers must not be cached without a licence.
const KEY='upec.original-cbt-session.v1';
export function saveSampleSession(session){
 if(session?.source!=='sample'||!Array.isArray(session.questions)||!session.questions.length)return false;
 try{localStorage.setItem(KEY,JSON.stringify(session));return true;}catch{return false;}
}
export function loadSampleSession(){
 try{const value=JSON.parse(localStorage.getItem(KEY)||'null');
  if(!value||value.source!=='sample'||!Array.isArray(value.questions)||!value.questions.length||!['timed','untimed','speed'].includes(value.practiceMode))return null;
  if(value.deadline!==null&&(!Number.isFinite(value.deadline)||value.deadline<=Date.now())){clearSampleSession();return null;}
  return value;
 }catch{return null;}
}
export function clearSampleSession(){try{localStorage.removeItem(KEY);}catch{}}
