# GHAZAL — Stage 2 Real Backend

This backend implements the locked API contract already declared by the Android client. It is server-only; the Stage 1 offline APK remains unchanged. Android network integration is Stage 3.

## Implemented routes
- Auth: register, login, refresh rotation, logout
- User: me, profile
- Progress: pull, optimistic-version sync, persisted conflict records
- Content: manifest, pack list, pack descriptor
- Classroom: classes, join codes, assignments, submissions, grades, announcements
- AI gateway: tutor, writing, conversation (enabled only when a server-side provider key exists)
- Analytics: batched events
- Entitlements and device push token registration
- Health endpoint

## Security controls
- scrypt password hashing with per-user salt
- HMAC-SHA256 short-lived access tokens
- random refresh tokens stored only as SHA-256 hashes and rotated on refresh
- PostgreSQL-backed rate limiting
- idempotency replay protection for mutating authenticated calls
- optimistic concurrency for progress sync and durable conflict evidence
- bounded JSON bodies, no-store responses, no client secrets
- CORS allow-list for future Web client

## Required production environment
- `DATABASE_URL`
- `GHAZAL_TOKEN_SECRET` (minimum 32 characters; generate randomly and store only in the hosting secret manager)
- optional `GHAZAL_ALLOWED_ORIGINS`
- optional `OPENAI_API_KEY` or `GHAZAL_AI_API_KEY`
- optional `GHAZAL_AI_BASE_URL`, `GHAZAL_AI_MODEL`

Run the SQL migration before production traffic: `node backend/migrate.js`.

## Deployment gate
A production deployment is not considered complete until a persistent PostgreSQL database and hosting project are connected, migration succeeds, `/healthz` returns `database=true`, and live auth + sync smoke tests pass.
