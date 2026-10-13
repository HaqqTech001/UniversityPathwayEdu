import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeAttempt,secondsRemaining,formatCountdown} from './practiceEngine.js';
import {practiceQuestions} from './practiceQuestions.js';
test('grades selected answers and leaves unanswered questions incorrect',()=>{
 const questions=practiceQuestions.slice(0,2);
 const grade=gradeAttempt(questions,{[questions[0].id]:questions[0].answer});
 assert.equal(grade.total,2);assert.equal(grade.answered,1);assert.equal(grade.correct,1);
 assert.equal(grade.results[1].selected,null);
});
test('countdown rounds up remaining seconds and never becomes negative',()=>{
 assert.equal(secondsRemaining(10000,9001),1);
 assert.equal(secondsRemaining(10000,10000),0);
 assert.equal(secondsRemaining(10000,11000),0);
 assert.equal(formatCountdown(180),'03:00');
 assert.equal(formatCountdown(9),'00:09');
});
