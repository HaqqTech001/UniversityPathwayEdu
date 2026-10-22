// Pure CBT helpers. Sample-only engine; never use this client-side scorer for official examinations.
export function gradeAttempt(questions,answers){
 const results=questions.map(q=>({id:q.id,subject:q.subject,topic:q.topic,selected:answers[q.id]??null,correct:q.answer,isCorrect:answers[q.id]===q.answer}));
 return {total:results.length,answered:results.filter(r=>r.selected!==null).length,correct:results.filter(r=>r.isCorrect).length,results};
}
export function secondsRemaining(deadlineMs,nowMs){return Math.max(0,Math.ceil((deadlineMs-nowMs)/1000))}
export function formatCountdown(seconds){const safe=Math.max(0,Math.floor(seconds));return `${String(Math.floor(safe/60)).padStart(2,'0')}:${String(safe%60).padStart(2,'0')}`}

// Practice-only diagnostics; topic summaries never affect official examination scoring.
export function summarizeTopics(questions,answers){
 const topics=new Map();
 for(const q of questions){
  const name=q.topic||'General';
  const item=topics.get(name)||{topic:name,total:0,answered:0,correct:0};
  item.total++;
  if(answers[q.id]!==undefined&&answers[q.id]!==null)item.answered++;
  if(answers[q.id]===q.answer)item.correct++;
  topics.set(name,item);
 }
 return [...topics.values()].map(item=>({...item,percentage:Math.round(item.correct/item.total*100)})).sort((a,b)=>a.percentage-b.percentage||a.topic.localeCompare(b.topic));
}
