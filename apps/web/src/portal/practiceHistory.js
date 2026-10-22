// Browser-only sample practice history; never an official examination transcript.
const KEY='upec.sample-practice-history.v1';
export function readPracticeHistory(){
 try{const parsed=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(parsed)?parsed.filter(x=>x&&typeof x.subject==='string'&&Number.isFinite(x.score)).slice(0,20):[];}catch{return [];}
}
export function savePracticeResult(entry){
 try{const next=[entry,...readPracticeHistory()].slice(0,20);localStorage.setItem(KEY,JSON.stringify(next));return next;}catch{return readPracticeHistory();}
}
export function clearPracticeHistory(){try{localStorage.removeItem(KEY);}catch{}return [];}
