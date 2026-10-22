// Shuffle a practice pool for each attempt; overlap is expected when students share a question bank.
// Never use client-side question selection for secure institutional examinations.
export function shuffledPracticePool(items,limit=items.length,random=Math.random){
 const copy=[...items];
 for(let i=copy.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [copy[i],copy[j]]=[copy[j],copy[i]];
 }
 return copy.slice(0,Math.max(0,Math.min(limit,copy.length)));
}
