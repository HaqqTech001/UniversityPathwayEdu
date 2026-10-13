import test from 'node:test';
import assert from 'node:assert/strict';
import {applicationSteps,validateStep} from './applicationSchema.js';
test('owner form wizard has four steps',()=>assert.equal(applicationSteps.length,4));
test('student details require core fields',()=>{
 const errors=validateStep(0,{});
 for(const field of ['surname','firstName','dateOfBirth','phone','currentAddress']) assert.ok(errors[field],field);
});
test('guardian and emergency contacts are checked',()=>{
 const errors=validateStep(1,{});
 for(const field of ['guardianName','guardianPhone','emergencyName','emergencyRelationship','emergencyPhone']) assert.ok(errors[field],field);
});
test('programme selection and preferred session are required',()=>{
 const errors=validateStep(2,{});
 assert.ok(errors.programmeCategory);
 assert.ok(errors.preferredSession);
});
test('invalid email and phone are rejected',()=>{
 const errors=validateStep(0,{surname:'Demo',firstName:'Student',dateOfBirth:'2005-01-01',phone:'bad',currentAddress:'Example Street',email:'bad'});
 assert.ok(errors.email);assert.ok(errors.phone);
});
test('valid minimal student details pass',()=>{
 const errors=validateStep(0,{surname:'Demo',firstName:'Student',dateOfBirth:'2005-01-01',phone:'08012345678',currentAddress:'Example Street',email:'demo@example.test'});
 assert.deepEqual(errors,{});
});
