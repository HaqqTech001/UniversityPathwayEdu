import test from 'node:test';
import assert from 'node:assert/strict';
import {saveSampleSession,loadSampleSession,clearSampleSession} from './sampleCbtSession.js';
import {CBT_QUESTION_BANK} from './cbtQuestionBank.ts';
const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const source=CBT_QUESTION_BANK[0];
const make=(owner,deadline=Date.now()+60000)=>({owner,source:'sample',questions:[source],answers:{[source.id]:source.answer},flagged:[],selectedSubjects:[source.subject],activeSubject:source.subject,currentQuestionIndex:0,practiceMode:'timed',deadline,durationMinutes:15});
test('sample recovery is scoped to student account',()=>{
 assert.equal(saveSampleSession(make('student-a'),'student-a'),true);
 assert.equal(loadSampleSession('student-b'),null);
 assert.equal(loadSampleSession('student-a')?.owner,'student-a');
 clearSampleSession('student-a');
});
test('expired and tampered sample sessions fail validation',()=>{
 assert.equal(saveSampleSession(make('student-a',Date.now()-1000),'student-a'),false);
 const altered=make('student-a');altered.questions=[{...source,prompt:'tampered'}];
 assert.equal(saveSampleSession(altered,'student-a'),false);
});

test('rejects an answer outside its question option range',()=>{
 const invalid=make('student-options');
 invalid.answers[source.id]=source.options.length;
 assert.equal(saveSampleSession(invalid,'student-options'),false);
 assert.equal(loadSampleSession('student-options'),null);
});
test('rejects duplicate flags but accepts one valid flag',()=>{
 const duplicated=make('student-flags');
 duplicated.flagged=[source.id,source.id];
 assert.equal(saveSampleSession(duplicated,'student-flags'),false);
 duplicated.flagged=[source.id];
 assert.equal(saveSampleSession(duplicated,'student-flags'),true);
 assert.deepEqual(loadSampleSession('student-flags')?.flagged,[source.id]);
 clearSampleSession('student-flags');
});
test('restores a valid shuffled sample question without changing its correct answer',()=>{
 const shuffled=make('student-shuffle');
 const original=shuffled.questions[0];
 const reversedOptions=[...original.options].reverse();
 shuffled.questions=[{...original,options:reversedOptions,answer:reversedOptions.indexOf(original.options[original.answer])}];
 shuffled.answers={[source.id]:shuffled.questions[0].answer};
 assert.equal(saveSampleSession(shuffled,'student-shuffle'),true);
 assert.equal(loadSampleSession('student-shuffle')?.questions[0].options[shuffled.questions[0].answer],source.options[source.answer]);
 clearSampleSession('student-shuffle');
});

test('stored practice expires before it can be resumed',()=>{
 const owner='student-expiry';
 const session=make(owner,Date.now()+1000);
 assert.equal(saveSampleSession(session,owner),true);
 session.deadline=Date.now()-1000;
 const key=[...store.keys()].find(value=>value.endsWith(':'+owner));
 assert.ok(key);
 store.set(key,JSON.stringify(session));
 assert.equal(loadSampleSession(owner),null);
 assert.equal(store.has(key),false);
});
test('tampered browser-storage answers are discarded on recovery',()=>{
 const owner='student-tamper';
 assert.equal(saveSampleSession(make(owner),owner),true);
 const key=[...store.keys()].find(value=>value.endsWith(':'+owner));
 assert.ok(key);
 const modified=JSON.parse(store.get(key));
 modified.answers[source.id]=source.options.length;
 store.set(key,JSON.stringify(modified));
 assert.equal(loadSampleSession(owner),null);
 assert.equal(store.has(key),false);
});
test('another user cannot restore the same stored practice session',()=>{
 const owner='student-owner';
 assert.equal(saveSampleSession(make(owner),owner),true);
 const key=[...store.keys()].find(value=>value.endsWith(':'+owner));
 const stored=store.get(key);
 const otherKey=key.replace(':'+owner,':student-other');
 store.set(otherKey,stored);
 assert.equal(loadSampleSession('student-other'),null);
 assert.equal(store.has(otherKey),false);
 clearSampleSession(owner);
});

test('rejects recovery with a question index outside the active subject',()=>{
 const session=make('student-question-index');
 session.currentQuestionIndex=1;
 assert.equal(saveSampleSession(session,'student-question-index'),false);
});
test('rejects recovery when active subject has no questions',()=>{
 const session=make('student-missing-subject');
 session.selectedSubjects=[source.subject,'Another Subject'];
 session.activeSubject='Another Subject';
 assert.equal(saveSampleSession(session,'student-missing-subject'),false);
});

test('malformed question entries and answer arrays fail recovery safely',()=>{
 const owner='student-malformed';
 const nullQuestion=make(owner);
 nullQuestion.questions=[null];
 assert.equal(saveSampleSession(nullQuestion,owner),false);
 const answerArray=make(owner);
 answerArray.answers=[];
 assert.equal(saveSampleSession(answerArray,owner),false);
 const malformedFlag=make(owner);
 malformedFlag.flagged=[null];
 assert.equal(saveSampleSession(malformedFlag,owner),false);
});

test('rejects subjects that do not correspond to the saved examination paper',()=>{
 const owner='student-subject-consistency';
 const unexpected=make(owner);
 unexpected.questions=[{...source,subject:'Unselected Subject'}];
 assert.equal(saveSampleSession(unexpected,owner),false);
 const duplicate=make(owner);
 duplicate.selectedSubjects=[source.subject,source.subject];
 assert.equal(saveSampleSession(duplicate,owner),false);
 const malformed=make(owner);
 malformed.selectedSubjects=[source.subject,null];
 assert.equal(saveSampleSession(malformed,owner),false);
});

test('rejects altered sample explanations, passages and topics',()=>{
 const owner='student-content-integrity';
 for(const field of ['explanation','passage','topic']){
  const session=make(owner);
  session.questions=[{...source,[field]:'Changed content'}];
  assert.equal(saveSampleSession(session,owner),false);
 }
});

test('validates timed and untimed session deadlines consistently',()=>{
 const untimed=make('student-untimed');
 untimed.practiceMode='untimed';
 untimed.deadline=null;
 assert.equal(saveSampleSession(untimed,'student-untimed'),true);
 clearSampleSession('student-untimed');
 untimed.deadline=Date.now()+60000;
 assert.equal(saveSampleSession(untimed,'student-untimed'),false);
 const timed=make('student-timed');
 timed.deadline=null;
 assert.equal(saveSampleSession(timed,'student-timed'),false);
});
test('rejects invalid practice durations',()=>{
 for(const minutes of [0,-1,1.5,1441,null]){
  const session=make('student-duration');
  session.durationMinutes=minutes;
  assert.equal(saveSampleSession(session,'student-duration'),false);
 }
});
