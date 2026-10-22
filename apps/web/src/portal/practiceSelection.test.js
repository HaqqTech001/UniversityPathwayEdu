import test from 'node:test';
import assert from 'node:assert/strict';
import {shuffledPracticePool} from './practiceSelection.js';
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
