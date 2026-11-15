# Auth Module — Manual API Test Report (KAN-226)

| | |
| --- | --- |
| **Date** | 2026-11-15 |
| **Branch / commit** | `feature/KAN-226-auth-backend` @ `32cc64d` |
| **Environment** | API on `http://localhost:5215` (Development), .NET SDK 10.0.115 |
| **Database** | Supabase (session pooler, `ap-southeast-1`), schema `identity` |
| **Method** | Black-box HTTP tests with `curl` + `jq` against the running API. Emailed tokens (verify / reset / activate) taken from the API console log (`LoggingEmailSender`). |
| **Result** | **64 / 64 passed** |

## Summary

| Area | Cases | Passed | Failed |
| --- | ---: | ---: | ---: |
| Health | 2 | 2 | 0 |
| Customer registration & email verification | 9 | 9 | 0 |
| Sessions (login, `/me`, refresh, logout, lockout) | 16 | 16 | 0 |
| Password reset | 10 | 10 | 0 |
| Staff applications (submit, review, activate) | 26 | 26 | 0 |
| Rate limiting | 1 | 1 | 0 |
| **Total** | **64** | **64** | **0** |

## Setup notes

- Functional cases ran with `Auth__RateLimiting__PermitLimit=1000` so the
  10-requests-per-minute limit wouldn't interfere. The rate-limit case (RL1)
  ran separately on a restarted API with the **default** settings.
- Each run uses unique test data: emails `qa-<run id>-…@fleetsync.test` and
  12-digit NICs derived from the run id. Run ids: `1794725220` (first run),
  `1794725286` (final run).
- The admin cases sign in as the development Fleet Administrator
  `admin@fleetsync.local` (created by `DevAdminSeeder`).

## Test cases

Expected result = HTTP status and, where relevant, the ProblemDetails `code`.

### 1. Health

| ID | Test case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| H1 | `GET /health/live` | 200 | 200 | ✅ Pass |
| H2 | `GET /health/ready` — database (Supabase) reachable | 200 `Healthy` | 200 `Healthy` | ✅ Pass |

### 2. Customer registration & email verification

| ID | Test case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| R1 | Register customer with valid data; reference matches `REG-yyyy-n` | 201 | 201 | ✅ Pass |
| R2 | Register again with the same email | 409 `auth.email_taken` | 409 `auth.email_taken` | ✅ Pass |
| R3 | Register with invalid fields → errors for `email`, `password`, `mobile`, `companyName` | 400 `validation_failed` | 400 `validation_failed` | ✅ Pass |
| R4 | Login before verifying the email | 403 `auth.email_not_verified` | 403 `auth.email_not_verified` | ✅ Pass |
| R5 | Resend verification email | 202 | 202 | ✅ Pass |
| R6 | Resend for an unknown email (no account enumeration) | 202 | 202 | ✅ Pass |
| R7 | Verify email with an invalid token | 400 `auth.invalid_token` | 400 `auth.invalid_token` | ✅ Pass |
| R8 | Verify email with the emailed token | 204 | 204 | ✅ Pass |
| R9 | Reuse the same verification token | 400 `auth.invalid_token` | 400 `auth.invalid_token` | ✅ Pass |

### 3. Sessions

| ID | Test case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| S1 | Login with wrong password → `attemptsLeft` returned | 401 `auth.invalid_credentials` | 401 `auth.invalid_credentials` | ✅ Pass |
| S2 | Login with unknown email → no `attemptsLeft` (no enumeration) | 401 `auth.invalid_credentials` | 401 `auth.invalid_credentials` | ✅ Pass |
| S3 | Web login → access token + `HttpOnly` refresh cookie, no refresh token in body | 200 | 200 | ✅ Pass |
| S4 | `GET /me` with access token → role `customer` | 200 | 200 | ✅ Pass |
| S5 | `GET /me` without a token | 401 | 401 | ✅ Pass |
| S6 | `GET /me` with a forged token | 401 | 401 | ✅ Pass |
| S7 | Refresh with cookie → new access token, rotated cookie | 200 | 200 | ✅ Pass |
| S8 | Replay the **old** refresh cookie | 401 `auth.invalid_refresh_token` | 401 `auth.invalid_refresh_token` | ✅ Pass |
| S9 | After a replay, the newest cookie is revoked too (whole session ended) | 401 | 401 `auth.invalid_refresh_token` | ✅ Pass |
| S10 | Mobile login (`X-Client-Type: mobile`) → `refreshToken` in body | 200 | 200 | ✅ Pass |
| S11 | Mobile refresh with token in body → new `refreshToken` in body | 200 | 200 | ✅ Pass\* |
| S12 | Logout (mobile token) | 204 | 204 | ✅ Pass |
| S13 | Refresh after logout | 401 | 401 `auth.invalid_refresh_token` | ✅ Pass |
| S14 | 4th wrong password → `attemptsLeft: 1` | 401 | 401 `auth.invalid_credentials` | ✅ Pass |
| S15 | 5th wrong password locks the account, `lockoutEnd` returned | 423 `auth.locked_out` | 423 `auth.locked_out` | ✅ Pass |
| S16 | Correct password while locked | 423 `auth.locked_out` | 423 `auth.locked_out` | ✅ Pass |

\* See [Findings](#findings): S11 failed on the first run because of a
mistake in the test, not the API.

### 4. Password reset

| ID | Test case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| P1 | Forgot password for an unknown email (no enumeration) | 202 | 202 | ✅ Pass |
| P2 | Forgot password for the customer | 202 | 202 | ✅ Pass |
| P3 | Reset lookup returns the account email | 200 | 200 | ✅ Pass |
| P4 | Reset lookup with an invalid token | 400 `auth.invalid_token` | 400 `auth.invalid_token` | ✅ Pass |
| P5 | Reset with a weak password | 400 | 400 `validation_failed` | ✅ Pass |
| P6 | Reset to the current password | 400 `auth.password_reused` | 400 `auth.password_reused` | ✅ Pass |
| P7 | Reset to a new valid password | 204 | 204 | ✅ Pass |
| P8 | Reuse the reset token | 400 `auth.invalid_token` | 400 `auth.invalid_token` | ✅ Pass |
| P9 | Login with the old password | 401 | 401 `auth.invalid_credentials` | ✅ Pass |
| P10 | Login with the new password | 200 | 200 | ✅ Pass |

### 5. Staff applications

| ID | Test case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| A1 | Driver application without licence details → `licenceNumber` error | 400 | 400 `validation_failed` | ✅ Pass |
| A2 | Upload a text file renamed to `.pdf` | 400 `staff_application.invalid_document` | 400 `staff_application.invalid_document` | ✅ Pass |
| A3 | Upload a PNG (only PDF/JPG allowed) | 400 | 400 `validation_failed` | ✅ Pass |
| A4 | Application with no documents | 400 | 400 `validation_failed` | ✅ Pass |
| A5 | Valid driver application (PDF + JPG), reference returned | 201 | 201 | ✅ Pass |
| A6 | Second open application with the same NIC | 409 `staff_application.duplicate` | 409 `staff_application.duplicate` | ✅ Pass |
| A7 | Valid mechanic application (no licence needed) | 201 | 201 | ✅ Pass |
| A8 | Review list without a token | 401 | 401 | ✅ Pass |
| A9 | Review list as a customer (not admin) | 403 | 403 | ✅ Pass |
| A10 | Admin login | 200 | 200 | ✅ Pass |
| A11 | Admin sees both new applications as `pending` | 200 | 200 | ✅ Pass |
| A12 | Application details include 2 documents | 200 | 200 | ✅ Pass |
| A13 | Download an attached document (PDF/JPG signature checked) | 200 | 200 | ✅ Pass |
| A14 | Details of a non-existent application | 404 | 404 `staff_application.not_found` | ✅ Pass |
| A15 | Reject without a reason | 400 | 400 `validation_failed` | ✅ Pass |
| A16 | Reject with a reason → status `rejected` | 200 | 200 | ✅ Pass |
| A17 | Approve an already-rejected application | 409 `staff_application.not_pending` | 409 `staff_application.not_pending` | ✅ Pass |
| A18 | Approve the driver application → status `approved`, activation email sent | 200 | 200 | ✅ Pass |
| A19 | Approved but not activated driver tries to log in | 401 | 401 `auth.invalid_credentials` | ✅ Pass |
| A20 | Activation lookup with the emailed token | 200 | 200 | ✅ Pass |
| A21 | Activate with a weak password | 400 | 400 `validation_failed` | ✅ Pass |
| A22 | Activate with a valid password | 204 | 204 | ✅ Pass |
| A23 | Reuse the activation token | 400 `auth.invalid_token` | 400 `auth.invalid_token` | ✅ Pass |
| A24 | Activated driver logs in | 200 | 200 | ✅ Pass |
| A25 | Driver `GET /me` → role `driver` | 200 | 200 | ✅ Pass |
| A26 | Application status is now `activated` | 200 | 200 | ✅ Pass |

### 6. Rate limiting (default settings)

| ID | Test case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| RL1 | 11 login requests within one minute from one IP → 11th rejected | 429 | 401 ×10, then 429 | ✅ Pass |

## Findings

1. **S11 — test error, not an API defect.** On the first run S11 failed:
   `/refresh` returned 200 but no `refreshToken` in the body. The API only
   returns the rotated refresh token in the body when the request carries
   `X-Client-Type: mobile`; otherwise it sets the cookie. The test sent the
   header on `/login` only. With the header added to `/refresh`, S11–S13
   passed.

2. **Documentation gap (open).** `docs/runbooks/auth-module.md` says to send
   `X-Client-Type: mobile` on `/login` only. A mobile client following it
   literally would lose the rotated refresh token on its first refresh and be
   signed out. The runbook should say to send the header on `/login`,
   `/refresh` and `/logout`. No impact yet: the mobile app doesn't call
   `/refresh`.

3. **No server errors.** The API log contained no `fail` entries or unhandled
   exceptions during either run.

## Not covered

- Token expiry over time (15-minute access token, 1-day / 30-day refresh
  session) and lockout ending after 15 minutes.
- File size and file count limits (5 MB, 5 files).
- Real email delivery (Development logs emails instead of sending them).
- Web and mobile UI — the web sign-in form isn't connected to the API yet
  (KAN-220).

## Test data left in Supabase

Customer accounts and staff applications with emails
`qa-1794725220-…@fleetsync.test` and `qa-1794725286-…@fleetsync.test`
(including one locked account and one activated driver). Delete them before
using this Supabase project for demos.
