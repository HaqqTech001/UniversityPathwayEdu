import test from 'node:test';
import assert from 'node:assert/strict';
import {shuffledPracticePool,shufflePracticeOptions} from './practiceSelection.js';
test('selection does not mutate the shared question bank',()=>{
 const pool=[1,2,3,4,5];const selected=shuffledPracticePool(pool,3,()=>0);
 assert.deepEqual(pool,[1,2,3,4,5]);
 assert.equal(selected.length,3);
 assert.equal(new Set(selected).size,3);
});
test('different shuffle draws can produce distinct practice papers',()=>{
 const pool=Array.from({length:12},(_,i)=>i);
 const a=shuffledPracticePool(pool,5,()=>0);
 const b=shuffledPracticePool(pool,5,()=>0.99);
 assert.notDeepEqual(a,b);
});
test('requested size cannot exceed available questions',()=>{
 assert.equal(shuffledPracticePool([1,2],20).length,2);
});

test('option shuffling retains the correct answer meaning',()=>{
 const q={id:'q1',options:['wrong A','correct','wrong C','wrong D'],answer:1};
 const transformed=shufflePracticeOptions(q,()=>0);
 assert.equal(transformed.options[transformed.answer],'correct');
 assert.deepEqual(q.options,['wrong A','correct','wrong C','wrong D']);
});
