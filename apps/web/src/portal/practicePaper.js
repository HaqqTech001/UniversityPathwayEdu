// Practice-only paper integrity checks. Official CBT needs server-side paper assignment.
export function preparePracticePaper(groups,minimumPerSubject=5){
 const seen=new Set(),seenContent=new Set(),paper=[],counts={};
 for(const group of groups){
  if(!Array.isArray(group)||!group.length)throw Error('A selected subject has no available questions.');
  const subject=group[0].subject;
  let count=0;
  for(const q of group){
   if(q.subject!==subject||!q.id||!Array.isArray(q.options)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3)continue;
   const key=subject+':'+String(q.id);
   // Provider feeds can contain identical question text under different IDs.
   const normalized=String(q.prompt||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
   const contentKey=normalized?subject+':'+normalized:null;
   if(seen.has(key)||(contentKey&&seenContent.has(contentKey)))continue;
   seen.add(key);
   if(contentKey)seenContent.add(contentKey);
   paper.push({...q,id:key});
   count++;
  }
  if(count<minimumPerSubject)throw Error('Not enough distinct valid questions for '+subject+'.');
  counts[subject]=count;
 }
 return {questions:paper,counts,isFullUtme:Object.keys(counts).length===4&&counts['Use of English']===60&&Object.entries(counts).filter(([name])=>name!=='Use of English').every(([,count])=>count===40)};
}
