import test from 'node:test';
import assert from 'node:assert/strict';
import {practiceQuestions} from './practiceQuestions.js';
test('practice questions have unique identifiers and valid answers',()=>{
 assert.ok(practiceQuestions.length>=4);
 const ids=new Set();
 for(const q of practiceQuestions){
  assert.ok(q.id && !ids.has(q.id));ids.add(q.id);
  assert.ok(q.subject && q.topic && q.prompt);
  assert.ok(Array.isArray(q.options) && q.options.length===4);
  assert.ok(Number.isInteger(q.answer) && q.answer>=0 && q.answer<q.options.length);
  assert.ok(q.explanation.length>0);
 }
});
test('each available subject contains practice questions',()=>{
 const subjects=new Set(practiceQuestions.map(q=>q.subject));
 assert.ok(subjects.has('Use of English'));
 assert.ok(subjects.has('Mathematics'));
 assert.ok(subjects.has('Biology'));
});
