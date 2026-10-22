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
