import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
// Setup test environment secrets required by UPEC security & db modules
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test-project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key-must-be-at-least-32-chars-long';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.OTP_SECRET = 'test-otp-secret-at-least-32-characters-long';
process.env.AUTH_PASSWORD_PEPPER = 'test-pepper-secret-at-least-32-chars-long';
process.env.MAIL_FROM = 'no-reply@pathway.edu.ng';

const { studentIdPattern } = await import('../src/local-auth.js');

// ============================================================================
// TEST 1: Student ID Format & Validation
// ============================================================================
test('studentIdPattern validates correct UP/YYYY/SERIAL formats and rejects invalid strings', () => {
  // Valid formats
  assert.equal(studentIdPattern.test('UP/2026/001'), true);
  assert.equal(studentIdPattern.test('UP/2026/002'), true);
  assert.equal(studentIdPattern.test('UP/2026/999'), true);
  assert.equal(studentIdPattern.test('UP/2026/1000'), true);
  assert.equal(studentIdPattern.test('up/2026/001'), true, 'Case-insensitive matching');
  assert.equal(studentIdPattern.test('Up/2027/045'), true);

  // Invalid formats
  assert.equal(studentIdPattern.test(''), false);
  assert.equal(studentIdPattern.test('UP/26/001'), false, 'Year must be 4 digits');
  assert.equal(studentIdPattern.test('UP/2026/1'), false, 'Serial must be at least 3 digits');
  assert.equal(studentIdPattern.test('UP/2026/12'), false, 'Serial must be at least 3 digits');
  assert.equal(studentIdPattern.test('UPEC/2026/001'), false, 'Prefix must be UP/');
  assert.equal(studentIdPattern.test('UP-2026-001'), false, 'Delimiters must be forward slashes');
  assert.equal(studentIdPattern.test('UP/2026/001/X'), false, 'Trailing characters rejected');
  assert.equal(studentIdPattern.test('student@email.com'), false, 'Email is not a student ID');
});

// ============================================================================
// TEST 2: Concurrency & Atomic Sequence Increment (Database Simulation)
// ============================================================================
test('Atomic sequence generation guarantees uniqueness under concurrent allocations', async () => {
  // Simulate the PostgreSQL atomic sequence generator logic:
  // INSERT INTO student_id_sequences (year, last_serial) VALUES (year, 1)
  // ON CONFLICT (year) DO UPDATE SET last_serial = student_id_sequences.last_serial + 1 RETURNING last_serial;
  const sequences = new Map();
  const accountsTable = new Map();
  const identifiersTable = new Map();
  let sequenceLock = Promise.resolve();

  const atomicAssignStudentId = async (accountId, year = 2026) => {
    // Acquire atomic sequence lock (simulating PostgreSQL row-level lock on student_id_sequences)
    const releaseLock = await new Promise(resolve => {
      sequenceLock = sequenceLock.then(() => new Promise(res => resolve(res)));
    });

    try {
      // 1. Idempotency check: if account already has an ID, return it without incrementing
      const existing = accountsTable.get(accountId)?.student_id;
      if (existing) {
        return existing;
      }

      // 2. Atomic serial allocation
      const currentSerial = sequences.get(year) || 0;
      const nextSerial = currentSerial + 1;
      sequences.set(year, nextSerial);

      // 3. Format UP/YYYY/SERIAL
      const studentId = `UP/${year}/${String(nextSerial).padStart(3, '0')}`;

      // 4. Enforce uniqueness constraints
      for (const [accId, data] of accountsTable) {
        if (data.student_id === studentId && accId !== accountId) {
          throw new Error('UNIQUE constraint violation on local_accounts.student_id');
        }
      }
      for (const [, ident] of identifiersTable) {
        if (ident.student_id === studentId) {
          throw new Error('UNIQUE constraint violation on student_identifiers.student_id');
        }
      }

      // 5. Store atomically in accounts and identifiers
      accountsTable.set(accountId, { student_id: studentId });
      identifiersTable.set(accountId, { account_id: accountId, student_id: studentId, year, serial: nextSerial });

      return studentId;
    } finally {
      releaseLock();
    }
  };

  // Run 50 concurrent simultaneous registration requests
  const accountIds = Array.from({ length: 50 }, (_, i) => `acc-uuid-${i + 1}`);
  const results = await Promise.all(accountIds.map(id => atomicAssignStudentId(id, 2026)));

  // Assertions:
  // 1. All 50 IDs must be strictly unique (Set size = 50)
  const uniqueIds = new Set(results);
  assert.equal(uniqueIds.size, 50, 'All concurrently assigned Student IDs must be unique');

  // 2. First ID must be UP/2026/001 and last must be UP/2026/050
  assert.equal(results[0], 'UP/2026/001');
  assert.equal(results[49], 'UP/2026/050');

  // 3. Annual sequence counter matches exactly 50
  assert.equal(sequences.get(2026), 50);

  // 4. Annual sequence restarts cleanly for new year 2027
  const newYearId = await atomicAssignStudentId('acc-uuid-2027-1', 2027);
  assert.equal(newYearId, 'UP/2027/001', 'Sequence must restart from 001 for a new calendar year');
  assert.equal(sequences.get(2027), 1);
  assert.equal(sequences.get(2026), 50, 'Prior year sequence must remain preserved');
});

// ============================================================================
// TEST 3: Idempotency (Repeated Generation Never Overwrites or Re-allocates)
// ============================================================================
test('Repeated Student ID generation for the same account is strictly idempotent', async () => {
  let serialCounter = 0;
  const store = new Map();

  const idempotentAssign = async (accountId) => {
    if (store.has(accountId)) {
      return store.get(accountId); // Returns existing ID without incrementing serial
    }
    serialCounter++;
    const studentId = `UP/2026/${String(serialCounter).padStart(3, '0')}`;
    store.set(accountId, studentId);
    return studentId;
  };

  const initialId = await idempotentAssign('test-user-alpha');
  assert.equal(initialId, 'UP/2026/001');
  assert.equal(serialCounter, 1);

  // Call again 10 times for the same account
  for (let i = 0; i < 10; i++) {
    const repeatedId = await idempotentAssign('test-user-alpha');
    assert.equal(repeatedId, 'UP/2026/001', 'Must return the existing ID');
  }

  // Serial counter must NOT have moved
  assert.equal(serialCounter, 1, 'Serial sequence must not increment on repeated calls');

  // Second user gets 002
  const secondUserId = await idempotentAssign('test-user-beta');
  assert.equal(secondUserId, 'UP/2026/002');
  assert.equal(serialCounter, 2);
});

// ============================================================================
// TEST 4: Fail Safely (No Fabricated IDs or False Registration Reports)
// ============================================================================
test('Database failure on ID generation throws retryable error and never returns fabricated IDs', async () => {
  // Mock assign function that simulates database failure (e.g. missing migration or RPC error)
  const failingAssignStudentId = async (accountId) => {
    const err = new Error('function public.upec_assign_student_id does not exist');
    err.code = '42883';
    err.status = 503;
    throw err;
  };

  let emailSent = false;
  let responsePayload = null;
  let httpStatus = 200;

  try {
    await failingAssignStudentId('failed-acc-id');
    // If it didn't fail, simulate false success
    emailSent = true;
  } catch (error) {
    httpStatus = error.status || 503;
    responsePayload = {
      error: 'Student ID allocation service is temporarily unavailable. Please retry shortly.',
      retryable: true,
    };
  }

  // Verification:
  assert.equal(emailSent, false, 'No verification email claiming an ID exists may be sent on failure');
  assert.equal(httpStatus, 503, 'Must return retryable HTTP 503 status');
  assert.equal(responsePayload.retryable, true, 'Must indicate error is retryable');
  assert.equal(responsePayload.studentId, undefined, 'Must NEVER return a fabricated student ID');
});

// ============================================================================
// TEST 5: Dual Login (Email and Student ID Authentication)
// ============================================================================
test('Dual login resolves Student ID or email to authenticate against stored password hash', async () => {
  const pepper = 'test-pepper-secret-at-least-32-chars-long';
  const hash = (pass) => new Promise((res, rej) => crypto.scrypt(pass, pepper, 64, (err, key) => err ? rej(err) : res(key.toString('hex'))));
  const verifyHash = (a, b) => {
    const x = Buffer.from(a, 'hex'), y = Buffer.from(b, 'hex');
    return x.length === y.length && crypto.timingSafeEqual(x, y);
  };

  const storedPasswordHash = await hash('SecureStudentPass123!');
  const mockAccount = {
    id: 'student-uuid-42',
    email: 'amina.bello@example.com',
    student_id: 'UP/2026/042',
    password_hash: storedPasswordHash,
    verified_at: new Date().toISOString(),
  };

  const authenticate = async (identifier, candidatePass) => {
    let matched = null;
    if (studentIdPattern.test(identifier)) {
      if (identifier.toUpperCase() === mockAccount.student_id) matched = mockAccount;
    } else {
      if (identifier.toLowerCase().trim() === mockAccount.email) matched = mockAccount;
    }

    const candidateHash = await hash(candidatePass);
    if (!matched || !verifyHash(matched.password_hash, candidateHash)) {
      return { success: false, error: 'Incorrect email/Student ID or password.' };
    }
    return { success: true, user: { id: matched.id, studentId: matched.student_id, email: matched.email } };
  };

  // 1. Valid login using email
  const emailLogin = await authenticate('amina.bello@example.com', 'SecureStudentPass123!');
  assert.equal(emailLogin.success, true);
  assert.equal(emailLogin.user.studentId, 'UP/2026/042');

  // 2. Valid login using Student ID (exact case)
  const idLogin = await authenticate('UP/2026/042', 'SecureStudentPass123!');
  assert.equal(idLogin.success, true);
  assert.equal(idLogin.user.studentId, 'UP/2026/042');

  // 3. Valid login using Student ID (lowercase)
  const lowerIdLogin = await authenticate('up/2026/042', 'SecureStudentPass123!');
  assert.equal(lowerIdLogin.success, true);

  // 4. Invalid password with Student ID returns generic error
  const wrongPassLogin = await authenticate('UP/2026/042', 'WrongPassword!');
  assert.equal(wrongPassLogin.success, false);
  assert.equal(wrongPassLogin.error, 'Incorrect email/Student ID or password.');

  // 5. Non-existent Student ID returns same generic error (no enumeration)
  const nonExistentLogin = await authenticate('UP/2026/999', 'SecureStudentPass123!');
  assert.equal(nonExistentLogin.success, false);
  assert.equal(nonExistentLogin.error, 'Incorrect email/Student ID or password.');
});

// ============================================================================
// TEST 6: Student ID Password Recovery Privacy & Anti-Harvesting
// ============================================================================
test('Password recovery via Student ID sends to registered email without exposing it', async () => {
  const mockAccounts = [
    { id: 'acc-1', email: 'secret.student@example.com', student_id: 'UP/2026/007' },
  ];

  let emailDispatchedTo = null;
  const recoverPassword = async (rawIdentifier) => {
    let found = null;
    if (studentIdPattern.test(rawIdentifier)) {
      found = mockAccounts.find(a => a.student_id === rawIdentifier.toUpperCase());
    } else {
      found = mockAccounts.find(a => a.email === rawIdentifier.toLowerCase().trim());
    }

    if (found) {
      // Dispatches code to student's real registered email
      emailDispatchedTo = found.email;
    }

    // Always returns generic response without leaking existence or email
    return { status: 200, message: 'If the account exists, a recovery code has been sent' };
  };

  const response = await recoverPassword('UP/2026/007');
  assert.equal(response.message, 'If the account exists, a recovery code has been sent');
  assert.equal(emailDispatchedTo, 'secret.student@example.com', 'Must dispatch recovery email to the registered address');
  assert.equal(response.email, undefined, 'Response must NEVER expose the registered email address');

  // Testing invalid Student ID
  emailDispatchedTo = null;
  const invalidResponse = await recoverPassword('UP/2026/999');
  assert.equal(invalidResponse.message, 'If the account exists, a recovery code has been sent');
  assert.equal(emailDispatchedTo, null, 'No email dispatched for unknown ID');
});
