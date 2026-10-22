// Browser-only sample practice history; never an official examination transcript.
const KEY='upec.sample-practice-history.v1';
const valid=x=>x&&typeof x.subject==='string'&&typeof x.id==='number'&&Number.isFinite(x.score)&&x.score>=0&&x.score<=100;
export function readPracticeHistory(){
 try{const parsed=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(parsed)?parsed.filter(valid).slice(0,20):[];}catch{return [];}
}
export function savePracticeResult(entry){
 if(!valid(entry))return readPracticeHistory();
 try{
  const next=[entry,...readPracticeHistory().filter(item=>item.id!==entry.id)].slice(0,20);
  localStorage.setItem(KEY,JSON.stringify(next));
  return next;
 }catch{return readPracticeHistory();}
}
export function clearPracticeHistory(){try{localStorage.removeItem(KEY);}catch{}return [];}
