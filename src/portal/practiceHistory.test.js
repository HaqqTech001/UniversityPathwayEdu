import test from 'node:test';
import assert from 'node:assert/strict';
import {readPracticeHistory,savePracticeResult,clearPracticeHistory} from './practiceHistory.js';
const data=new Map();
globalThis.localStorage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
const entry=(id,score)=>({id,subject:'Mathematics',score,completedAt:'2026-10-22T00:00:00Z'});
test('repeated save of same practice attempt does not duplicate',()=>{
 clearPracticeHistory();
 savePracticeResult(entry(111,60));
 savePracticeResult(entry(111,80));
 assert.equal(readPracticeHistory().length,1);
 assert.equal(readPracticeHistory()[0].score,80);
});
test('history is bounded to 20 entries and can be cleared',()=>{
 clearPracticeHistory();
 for(let id=0;id<30;id++)savePracticeResult(entry(id,70));
 assert.equal(readPracticeHistory().length,20);
 assert.deepEqual(clearPracticeHistory(),[]);
 assert.equal(readPracticeHistory().length,0);
});
test('invalid records are ignored',()=>{
 clearPracticeHistory();
 savePracticeResult(entry(1,NaN));
 assert.equal(readPracticeHistory().length,0);
});
