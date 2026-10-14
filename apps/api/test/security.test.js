import test from 'node:test';
import assert from 'node:assert/strict';
import {signToken,requireRole} from '../src/security.js';

test('signed student token is accepted and wrong roles are rejected',()=>{
 process.env.JWT_SECRET='test-only-jwt-secret-at-least-32-characters';
 const token=signToken({sub:'student-123',role:'student'});
 const req={headers:{authorization:'Bearer '+token}};
 let called=false;
 requireRole('student')(req,{status(){throw Error('unexpected denial')}},()=>{called=true});
 assert.equal(called,true);
 assert.equal(req.actor.sub,'student-123');
 let status;
 requireRole('admin')(req,{status(code){status=code;return {json(){}}}},()=>{throw Error('unexpected access')});
 assert.equal(status,401);
});
test('tampered token is rejected',()=>{
 process.env.JWT_SECRET='test-only-jwt-secret-at-least-32-characters';
 const token=signToken({sub:'student-123',role:'student'});
 let status;
 requireRole('student')({headers:{authorization:'Bearer '+token+'invalid'}},{status(code){status=code;return {json(){}}}},()=>{throw Error('unexpected access')});
 assert.equal(status,401);
});
