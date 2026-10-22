import test from 'node:test';
import assert from 'node:assert/strict';
import {preparePracticePaper} from './practicePaper.js';
const q=(subject,id)=>({id,subject,options:['A','B','C','D'],answer:1});
test('same provider question ID from different subjects remains distinct',()=>{
 const paper=preparePracticePaper([[q('English','123')],[q('Math','123')]],1);
 assert.equal(paper.questions.length,2);
 assert.notEqual(paper.questions[0].id,paper.questions[1].id);
});
test('duplicate IDs in same subject are not counted twice',()=>{
 assert.throws(()=>preparePracticePaper([[q('Math','1'),q('Math','1')]],2),/Not enough distinct/);
});
test('short drill is not labelled as full UTME',()=>{
 assert.equal(preparePracticePaper([[q('English','1')],[q('Math','2')]],1).isFullUtme,false);
});

test('same question text under different provider IDs is not repeated',()=>{
 const first={...q('Mathematics','one'),prompt:'Solve 2x = 8'};
 const duplicate={...q('Mathematics','two'),prompt:'  SOLVE   2x = 8  '};
 const second={...q('Mathematics','three'),prompt:'Find 5 + 7'};
 const paper=preparePracticePaper([[first,duplicate,second]],2);
 assert.equal(paper.questions.length,2);
 assert.deepEqual(paper.questions.map(item=>item.id),['Mathematics:one','Mathematics:three']);
});
