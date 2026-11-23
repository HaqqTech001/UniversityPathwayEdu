import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../migrations/20261121_assessment_start_eligibility_guard.sql', import.meta.url),
  'utf8',
);

test('assessment start RPC enforces the published examination window atomically', () => {
  assert.match(migration, /v_exam\.status\s*<>\s*'published'/i);
  assert.match(migration, /v_exam\.opens_at\s+is\s+not\s+null/i);
  assert.match(migration, /v_exam\.closes_at\s+is\s+not\s+null/i);
});

test('assessment start RPC requires an approved and verified student account', () => {
  assert.match(migration, /local_accounts[\s\S]*verified_at\s+is\s+not\s+null/i);
  assert.match(migration, /local_student_applications[\s\S]*status\s*=\s*'approved'/i);
});

test('restricted assessments require an explicit eligibility assignment', () => {
  assert.match(migration, /if\s+v_exam\.restricted\s+and\s+not\s+exists/i);
  assert.match(migration, /upec_assessment_eligibility[\s\S]*assessment_id\s*=\s*p_assessment[\s\S]*student_account_id\s*=\s*p_student/i);
});

test('assessment start preserves the one-attempt rule and caps expiry at exam close', () => {
  assert.match(migration, /least\([\s\S]*v_exam\.closes_at/i);
  assert.match(migration, /on\s+conflict\s*\(assessment_id,student_account_id\)\s+do\s+nothing/i);
});
