// Pure CBT helpers. Sample-only engine; never use this client-side scorer for official examinations.
export function gradeAttempt(questions,answers){
 const results=questions.map(q=>({id:q.id,subject:q.subject,topic:q.topic,selected:answers[q.id]??null,correct:q.answer,isCorrect:answers[q.id]===q.answer}));
 return {total:results.length,answered:results.filter(r=>r.selected!==null).length,correct:results.filter(r=>r.isCorrect).length,results};
}
export function secondsRemaining(deadlineMs,nowMs){return Math.max(0,Math.ceil((deadlineMs-nowMs)/1000))}
export function formatCountdown(seconds){const safe=Math.max(0,Math.floor(seconds));return `${String(Math.floor(safe/60)).padStart(2,'0')}:${String(safe%60).padStart(2,'0')}`}
