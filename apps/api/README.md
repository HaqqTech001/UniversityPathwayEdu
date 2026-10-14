# UPEC supervised CBT backend foundation

Node 22+, MySQL 8. Create a database, configure DATABASE_URL and JWT_SECRET in apps/api/.env, then run npm install and npm run dev in apps/api. Tables are created on startup.

For LOCAL testing only set ENABLE_DEV_TOKENS=true and POST /api/dev/token with {"sub":"admin-1","role":"admin"} or {"sub":"student-1","role":"candidate"}. Use the resulting Bearer token.

Admin endpoints: POST /api/cbt/rooms (title, durationSeconds); GET /api/cbt/rooms; POST /api/cbt/rooms/:id/start; POST /api/cbt/rooms/:id/end; GET /api/cbt/rooms/:id/monitor.
Candidate endpoints: POST /api/cbt/rooms/:id/join; GET /api/cbt/rooms/:id/session; PUT /api/cbt/rooms/:id/answers/:questionId (optionIndex); POST /api/cbt/rooms/:id/events (eventType); POST /api/cbt/rooms/:id/submit (reason).

No video recording or storage. This is NOT production-ready: live camera transport, frontend integration, actual UPEC authentication, question-bank assignment and answer-key protection, scoring, secure room admission, atomic timeout handling, event enforcement, consent, and testing remain. Client-supplied focus events are not tamper-proof. Browser screenshot prevention cannot be guaranteed.
