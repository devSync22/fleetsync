# FleetSync — Auth API Testing (KAN-226)

All manual test cases for the Auth module API in one place: the core flows
and the features added when the database was rebuilt to match the EER diagram.

| | |
| --- | --- |
| **Branch** | `feature/KAN-226-auth-backend` |
| **Environment** | API on `http://localhost:5215` (Development), .NET 10 |
| **Database** | Supabase PostgreSQL (session pooler, `ap-southeast-1`), schema `identity`, migration `20261115071916_AddAuthModule`. Both parts also passed on a local PostgreSQL 18.6 |
| **Method** | Black-box HTTP calls with `curl` + `jq` against the running API; emailed tokens are read from the dev email folder (`App_Data/dev-emails`); part B also checks rows with `psql` |
| **Scripts** | [`auth-core-flows.sh`](../../apps/api/tests/manual/auth-core-flows.sh) (part A), [`auth-new-features.sh`](../../apps/api/tests/manual/auth-new-features.sh) (part B) |
| **Last updated** | 2026-11-15 |

## Summary

| Part | Area | Cases | Result |
| --- | --- | ---: | --- |
| A | Health | 2 | ✅ all passed |
| A | Customer registration, email verification and approval | 14 | ✅ all passed |
| A | Sessions | 16 | ✅ all passed |
| A | Password reset | 10 | ✅ all passed |
| A | Staff applications and activation | 26 | ✅ all passed |
| A | Rate limiting | 1 | ✅ passed |
| B | Customer approval flow | 22 | ✅ all passed |
| B | Staff roles and EER subtype tables | 21 | ✅ all passed |
| B | Profile change requests | 26 | ✅ all passed |
| B | Account deactivation (`is_active`) | 11 | ✅ all passed |
| B | Audit log | 10 | ✅ all passed |
| B | Session metadata | 1 | ✅ all passed |
| | **Total** | **160** | **160 passed** |

**Part A** passed 68/68 on Supabase (latest run `1794731096`, plus RL1) and on
local PostgreSQL (run `1794729902`).

**Part B** passed 91/91 on Supabase (latest run `1794731145`) and on local
PostgreSQL (run `1794729962`). The failures seen along the way were all mistakes in the
test script or leftover test data, described under [Findings](#findings).

Alongside: **79 unit tests** and **29 integration tests** (including
`EerTablesTests` and `ApiRulesTests`) all pass. The API log had no errors and
no tokens in any run.

## How to run

1. Start the API in Development, raising the rate limit so the run isn't
   throttled. Emailed links are read from `App_Data/dev-emails/`, where
   Development saves emails:

   ```bash
   Auth__RateLimiting__PermitLimit=1000 dotnet run --project apps/api/src/FleetSync.Api --launch-profile http
   ```

2. From the repo root, run either part:

   ```bash
   bash apps/api/tests/manual/auth-core-flows.sh     # part A
   bash apps/api/tests/manual/auth-new-features.sh   # part B
   ```

3. For the rate-limit case (RL1), restart the API **without** the
   `PermitLimit` override and run:

   ```bash
   bash apps/api/tests/manual/auth-core-flows.sh ratelimit
   ```

Prerequisites: `curl`, `jq`, `python3`, `psql`; the connection string and
`Auth:DevAdmin:*` in User Secrets (see [auth-module.md](../runbooks/auth-module.md)).
Each run uses fresh `qa-<run id>-…@fleetsync.test` emails, so the scripts can be
repeated. Part B stops with exit code 2 if the database or the dev admin can't
be reached.

**Expected result** is the HTTP status and, where relevant, the ProblemDetails
`errorCode`. "Database check passes" means the script queried the tables directly.

## Test accounts per role

For manual sign-in testing of the web and mobile apps. Development only: set
`Auth:DevTestAccounts:Password` in User Secrets and restart the API (see
[auth-module.md](../runbooks/auth-module.md), Local setup step 3). Every account
uses that password; the examples below assume `FleetSync@2026`.

| Role | Email | Sign in on | Expected after sign-in |
| ---- | ----- | ---------- | ---------------------- |
| Fleet Owner | `owner@fleetsync.local` | Web | "You're signed in" page (no owner area yet) |
| Fleet Administrator | `admin@fleetsync.local` | Web | "You're signed in" page (no admin area yet) |
| Operational Coordinator | `coordinator@fleetsync.local` | Web | `/coordinator` dashboard; top bar shows "Test Coordinator" |
| Customer | `customer@fleetsync.local` | Web | `/customer` dashboard; top bar shows "Test Customer" |
| Driver | `driver@fleetsync.local` | Mobile | Driver Home tab ("Good …, Test") |
| Mechanic | `mechanic@fleetsync.local` | Mobile | Mechanic Maintenance queue |

If `Auth:DevAdmin:Email` is also `admin@fleetsync.local`, that account already
exists and keeps the `Auth:DevAdmin:Password` instead.

Checks worth doing by hand:

- Web, signed out: opening `/coordinator` or `/customer` goes to sign in, then back to that page.
- Web, signed in as the customer: opening `/coordinator` goes back to `/customer` (and the other way round).
- Web: **Log out** in the sidebar ends the session; Back does not reopen the area.
- Mobile: a web-only account (e.g. the customer) is refused with "This app is for drivers and mechanics…".
- Mobile: Profile → Change password signs out other devices; this phone stays signed in.
- Wrong password five times locks the account for 15 minutes (`auth.locked_out`).

# Part A — Core flows

## A1. Health

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| H1 | Liveness endpoint | 200 | ✅ Pass |
| H2 | Readiness: database (Supabase) reachable | 200 | ✅ Pass |

## A2. Customer registration, email verification and approval

Customers apply, verify their email and are approved by a Fleet Administrator before they can sign in.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| R1 | Register customer with valid data | 201 | ✅ Pass |
| R2 | Register again while the first application is open | 409 `application.duplicate` | ✅ Pass |
| R3 | Register with invalid fields -> per-field errors | 400 | ✅ Pass |
| R4 | Login (right password) before verifying email | 403 `auth.email_not_verified` | ✅ Pass |
| R5 | Resend verification email | 202 | ✅ Pass |
| R6 | Resend for unknown email still 202 (no account enumeration) | 202 | ✅ Pass |
| R7 | Verify email with an invalid token | 400 `auth.invalid_token` | ✅ Pass |
| R8 | Verify email with the emailed token | 204 | ✅ Pass |
| R9 | Reuse the same verification token | 400 `auth.invalid_token` | ✅ Pass |
| R10 | Verified but not yet approved: told it's pending | 403 `auth.pending_approval` | ✅ Pass |
| R11 | Pending + wrong password looks like any failed login | 401 `auth.invalid_credentials` | ✅ Pass |
| R12 | Admin can't approve an unverified customer | 409 `application.email_not_verified` | ✅ Pass |
| R13 | Admin approves the verified customer -> account created | 200 | ✅ Pass |
| R14 | Register with an email that now has an account | 409 `auth.email_taken` | ✅ Pass |

## A3. Sessions

Sign-in, `/me`, refresh-token rotation and replay detection, mobile tokens, sign-out and lockout.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| S1 | Login with wrong password -> attemptsLeft shown | 401 | ✅ Pass |
| S2 | Login with unknown email -> no attemptsLeft | 401 | ✅ Pass |
| S3 | Web login: access token + HttpOnly refresh cookie | 200 | ✅ Pass |
| S4 | GET /me with access token -> customer role | 200 | ✅ Pass |
| S5 | GET /me without a token | 401 | ✅ Pass |
| S6 | GET /me with a forged token | 401 | ✅ Pass |
| S7 | Refresh with cookie -> new access token, rotated cookie | 200 | ✅ Pass |
| S8 | Reuse the OLD refresh cookie (replay) is rejected | 401 `auth.invalid_refresh_token` | ✅ Pass |
| S9 | After replay, the newest cookie is revoked too (session ended) | 401 | ✅ Pass |
| S10 | Mobile login returns refreshToken in the body | 200 | ✅ Pass |
| S11 | Mobile refresh with body token | 200 | ✅ Pass |
| S12 | Logout | 204 | ✅ Pass |
| S13 | Refresh after logout is rejected | 401 | ✅ Pass |
| S14 | 4th wrong password -> 1 attempt left | 401 | ✅ Pass |
| S15 | 5th wrong password locks the account | 423 | ✅ Pass |
| S16 | Correct password while locked is still refused | 423 | ✅ Pass |

## A4. Password reset

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| P1 | Forgot password for unknown email still 202 | 202 | ✅ Pass |
| P2 | Forgot password for the customer | 202 | ✅ Pass |
| P3 | Reset lookup returns the account email | 200 | ✅ Pass |
| P4 | Reset lookup with an invalid token | 400 `auth.invalid_token` | ✅ Pass |
| P5 | Reset with a weak password | 400 | ✅ Pass |
| P6 | Reset to the current password (reuse) is refused | 400 `auth.password_reused` | ✅ Pass |
| P7 | Reset to a new valid password | 204 | ✅ Pass |
| P8 | Reuse the reset token | 400 `auth.invalid_token` | ✅ Pass |
| P9 | Old password no longer works | 401 | ✅ Pass |
| P10 | New password works | 200 | ✅ Pass |

## A5. Staff applications and activation

Submit, document checks, admin review under `/applications`, approve or reject, activation link, sign-in.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| A1 | Driver application without licence details | 400 | ✅ Pass |
| A2 | Upload a text file renamed to .pdf | 400 `application.invalid_document` | ✅ Pass |
| A3 | Upload a PNG (only PDF/JPG allowed) | 400 | ✅ Pass |
| A4 | Application with no documents | 400 | ✅ Pass |
| A5 | Valid driver application (PDF + JPG) | 201 | ✅ Pass |
| A6 | Second open application with the same NIC | 409 `application.duplicate` | ✅ Pass |
| A7 | Valid mechanic application (no licence needed) | 201 | ✅ Pass |
| A8 | Review list without a token | 401 | ✅ Pass |
| A9 | Review list as a customer (not admin) | 403 | ✅ Pass |
| A10 | Admin (dev seeder) is a fleet-administrator | 200 | ✅ Pass |
| A11 | Admin sees both new applications as pending | 200 | ✅ Pass |
| A12 | Application details with 2 documents | 200 | ✅ Pass |
| A13 | Download an attached document | 200 | ✅ Pass |
| A14 | Details of a non-existent application | 404 `application.not_found` | ✅ Pass |
| A15 | Reject without a reason | 400 | ✅ Pass |
| A16 | Reject with a reason | 200 | ✅ Pass |
| A17 | Approve an already-rejected application | 409 `application.not_pending` | ✅ Pass |
| A18 | Approve the driver application | 200 | ✅ Pass |
| A19 | Approved but not activated driver cannot log in | 401 | ✅ Pass |
| A20 | Activation lookup with emailed token | 200 | ✅ Pass |
| A21 | Activate with a weak password | 400 | ✅ Pass |
| A22 | Activate with a valid password | 204 | ✅ Pass |
| A23 | Reuse the activation token | 400 `auth.invalid_token` | ✅ Pass |
| A24 | Activated driver can log in | 200 | ✅ Pass |
| A25 | Driver /me shows the driver role | 200 | ✅ Pass |
| A26 | Application is now marked activated | 200 | ✅ Pass |

## A6. Rate limiting

Runs separately, with the default limit of 10 requests per minute per IP.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| RL1 | 11 sign-in requests in one minute from one IP: the 11th is rejected | 429 | ✅ Pass (401 ×10, then 429) |

# Part B — EER features

## B1. Customer approval flow

Customers apply through `USER_APPLICATION`: register → verify email → a Fleet Administrator approves → the account is created with the password chosen at registration. Approval creates a `CUSTOMER` row linked to a `CUSTOMER_COMPANY`.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| CA01 | Customer registration creates an application with a reference | 201 | ✅ Pass |
| CA02 | No account exists yet; application is pending with a password hash | Database check passes | ✅ Pass |
| CA03 | Sign-in before verifying (right password) -> told to verify | 403 `auth.email_not_verified` | ✅ Pass |
| CA04 | Sign-in before verifying (wrong password) reveals nothing | 401 `auth.invalid_credentials` | ✅ Pass |
| CA05 | Second registration while the first is open | 409 `application.duplicate` | ✅ Pass |
| CA06 | Resend verification for a pending application | 202 | ✅ Pass |
| CA07 | Verify with the resent token | 204 | ✅ Pass |
| CA08 | Verified but not approved -> pending approval | 403 `auth.pending_approval` | ✅ Pass |
| CA09 | Review list filtered by role=customer shows it as verified | 200 | ✅ Pass |
| CA10 | Unknown role filter | 400 | ✅ Pass |
| CA11 | Approving an unverified customer is refused | 409 `application.email_not_verified` | ✅ Pass |
| CA12 | Approve the verified customer -> account linked (userId) | 200 | ✅ Pass |
| CA13 | Approval email sent to the customer | 200 | ✅ Pass |
| CA14 | Approving twice | 409 `application.not_pending` | ✅ Pass |
| CA15 | Approved customer signs in with the registration password | 200 | ✅ Pass |
| CA16 | CUSTOMER row linked to a CUSTOMER_COMPANY with the registration details | Database check passes | ✅ Pass |
| CA17 | Password hash removed from the approved application | Database check passes | ✅ Pass |
| CA18 | Second contact with the same registration number joins the same company | Database check passes | ✅ Pass |
| CA19 | Reject a customer with a reason | 200 | ✅ Pass |
| CA20 | Rejected application keeps no password hash and creates no account | Database check passes | ✅ Pass |
| CA21 | Rejected customer can't sign in | 401 `auth.invalid_credentials` | ✅ Pass |
| CA22 | Registering an email that now has an account | 409 `auth.email_taken` | ✅ Pass |

## B2. Staff roles and EER subtype tables

Driver, mechanic, coordinator and owner applications. On activation each account gets its subtype row (`DRIVER`, `MECHANIC`, `OPERATIONAL_COORDINATOR`, `FLEET_OWNER`). Each user has exactly one role. Only Fleet Administrators review.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| SR01 | Staff form refuses role=customer | 400 | ✅ Pass |
| SR02 | Staff form refuses role=fleet-administrator | 400 | ✅ Pass |
| SR03 | Driver with an expired licence | 400 | ✅ Pass |
| SR04 | Driver with a badly formatted expiry date | 400 | ✅ Pass |
| SR05 | Driver application with licence expiry | 201 | ✅ Pass |
| SR06 | Mechanic application | 201 | ✅ Pass |
| SR07 | Coordinator application | 201 | ✅ Pass |
| SR08 | Owner application (EER requested_role OWNER) | 201 | ✅ Pass |
| SR09 | Details show the licence expiry | 200 | ✅ Pass |
| SR10 | Driver activates | 204 | ✅ Pass |
| SR11 | Mechanic activates | 204 | ✅ Pass |
| SR12 | Coordinator activates | 204 | ✅ Pass |
| SR13 | Owner activates | 204 | ✅ Pass |
| SR14 | DRIVER row with licence number, class and expiry | Database check passes | ✅ Pass |
| SR15 | MECHANIC, OPERATIONAL_COORDINATOR and FLEET_OWNER rows exist | Database check passes | ✅ Pass |
| SR16 | Dev admin has a FLEET_ADMINISTRATOR row | Database check passes | ✅ Pass |
| SR17 | Every user has exactly one role and its matching subtype row | Database check passes | ✅ Pass |
| SR18 | Database refuses a second role for a user (unique UserRoles.UserId) | Database check passes | ✅ Pass |
| SR19 | Application reviewed_by references the Fleet Administrator | Database check passes | ✅ Pass |
| SR20 | Another driver with the same licence number | 409 `application.licence_taken` | ✅ Pass |
| SR21 | Owner can't review applications (Fleet Administrators only) | 403 | ✅ Pass |

## B3. Profile change requests

`PROFILE_CHANGE_REQUEST`: a signed-in user asks to change one detail; a Fleet Administrator approves (the change is applied) or rejects it.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| PC01 | Anonymous request | 401 | ✅ Pass |
| PC02 | Unknown field | 400 | ✅ Pass |
| PC03 | Invalid phone number | 400 | ✅ Pass |
| PC04 | Request a phone change (old and new values normalised) | 201 | ✅ Pass |
| PC05 | Not applied before approval | Database check passes | ✅ Pass |
| PC06 | Second pending request for the same field | 409 `profile_change.duplicate` | ✅ Pass |
| PC07 | Same as the current value | 400 `profile_change.no_change` | ✅ Pass |
| PC08 | Licence field for a customer | 400 `profile_change.field_not_allowed` | ✅ Pass |
| PC09 | Email already used by another account | 409 `auth.email_taken` | ✅ Pass |
| PC10 | User lists their own requests | 200 | ✅ Pass |
| PC11 | Admin review list includes the request | 200 | ✅ Pass |
| PC12 | Customer can't open the review list | 403 | ✅ Pass |
| PC13 | Customer can't approve | 403 | ✅ Pass |
| PC14 | Admin approves the phone change | 200 | ✅ Pass |
| PC15 | Phone applied, updated_at set, approved_by = admin | Database check passes | ✅ Pass |
| PC16 | Approving twice | 409 `profile_change.not_pending` | ✅ Pass |
| PC17 | Unknown request id | 404 `profile_change.not_found` | ✅ Pass |
| PC18 | Admin approves an email change | 200 | ✅ Pass |
| PC19 | Sign in with the new email | 200 | ✅ Pass |
| PC20 | Old email no longer signs in | 401 | ✅ Pass |
| PC21 | Driver licence-number change approved | 200 | ✅ Pass |
| PC22 | DRIVER row updated (stored upper-case) | Database check passes | ✅ Pass |
| PC23 | Reject without a reason | 400 | ✅ Pass |
| PC24 | Reject with a reason | 200 | ✅ Pass |
| PC25 | Rejected change isn't applied | Database check passes | ✅ Pass |
| PC26 | Admin can't approve their own change | 403 `profile_change.self_review` | ✅ Pass |

## B4. Account deactivation (`is_active`)

`PUT /users/{id}/status`. A deactivated account can't sign in, loses its sessions and gets no reset emails. `updated_at` changes only when account details change.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| US01 | Sign-in (failed or successful) doesn't change updated_at | Database check passes | ✅ Pass |
| US02 | Non-admin can't deactivate | 403 | ✅ Pass |
| US03 | Unknown user | 404 `user.not_found` | ✅ Pass |
| US04 | Admin can't deactivate themselves | 400 `user.cannot_deactivate_self` | ✅ Pass |
| US05 | Admin deactivates a customer | 200 | ✅ Pass |
| US06 | Deactivated account, right password | 403 `auth.account_disabled` | ✅ Pass |
| US07 | Deactivated account, wrong password reveals nothing | 401 `auth.invalid_credentials` | ✅ Pass |
| US08 | Existing session ended | 401 `auth.invalid_refresh_token` | ✅ Pass |
| US09 | Forgot password still 202 but no email is sent | 202 | ✅ Pass |
| US10 | Admin reactivates the account | 200 | ✅ Pass |
| US11 | Reactivated account signs in | 200 | ✅ Pass |

## B5. Audit log

`AUDIT_LOG` records sign-ins, failures, sign-outs, application and profile decisions, activation and deactivation. `GET /audit-log` is admin-only.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| AU01 | User history: sign-in, failure, sign-out, deactivate, reactivate | 200 | ✅ Pass |
| AU02 | Application lifecycle events recorded for the driver | Database check passes | ✅ Pass |
| AU03 | Customer events: verified and rejected applications | Database check passes | ✅ Pass |
| AU04 | Activation and profile change events recorded | Database check passes | ✅ Pass |
| AU05 | Unknown-email failure logged without a user or the typed email | Database check passes | ✅ Pass |
| AU06 | Action filter is case-insensitive | 200 | ✅ Pass |
| AU07 | Entries carry the client IP | 200 | ✅ Pass |
| AU08 | Audit log: non-admin | 403 | ✅ Pass |
| AU09 | Audit log: anonymous | 401 | ✅ Pass |
| AU10 | No tokens or passwords in audit details | Database check passes | ✅ Pass |

## B6. Session metadata

`RefreshTokens` (USER_SESSION) store the client IP address and User-Agent.

| ID | Test case | Expected result | Result |
| --- | --- | --- | --- |
| SM01 | Sessions store the client IP and User-Agent | Database check passes | ✅ Pass |

## Findings

1. **Mobile refresh needs `X-Client-Type: mobile` (test error, docs fixed).**
   S11 failed on the very first run because the test sent the header on
   `/login` only; the API returns the rotated refresh token in the body only
   when the header is present on `/refresh` too. The runbook now says to send
   it on `/login`, `/refresh` and `/logout`.
2. **U1 (test error).** The check read `isActive: false` with a jq expression
   that treats `false` as missing. The account had been deactivated correctly
   (the next two cases confirmed it); the check was fixed.
3. **PC8 (test data).** A second run failed because the first run left the
   shared admin's own change request pending, and the API correctly allows one
   pending request per field. The scripts now clean that request up.
4. **`updated_at` changed on failed sign-ins (API bug, fixed).** Identity's
   `UserManager.UpdateAsync` flags every column as modified, so a failed
   sign-in counted as an account update. `AuthDbContext` now compares old and
   new values. Covered by case US01 and the integration test
   `Sign_in_bookkeeping_does_not_count_as_an_account_update`.
5. **Database unreachable on the 4G connection (resolved).** Mid-session,
   Postgres connections stopped getting a reply: TCP connected, but the
   server's first protocol message never arrived, for Supabase and for an
   unrelated public Postgres server alike. Supabase reported no incident and no
   network bans. The 4G router/carrier was dropping database traffic; on a
   mobile hotspot everything connected again. Meanwhile, part B and the
   integration tests ran on a throwaway local PostgreSQL 18.6, then part B was
   rerun on Supabase.
6. **SR15, AU04, SR18 (test errors).** On the first part B run, two checks
   concatenated `count(*)` values with `||` (not allowed for numbers in
   Postgres), and SR18 misread the expected "duplicate key" rejection because
   of `pipefail`. The database behaved correctly in all three; the checks were
   fixed and passed.
7. **PC26 on Supabase (test data).** The first Supabase run of part B failed
   PC26 because an interrupted earlier run had left the shared admin's own
   change request pending (one pending request per field is enforced). The
   script now clears that leftover before the case; the rerun passed.
8. **Backend guide alignment.** After the backend guide was adopted, the API
   was changed to match it: error responses use `errorCode`; deny-by-default
   fallback policy; `RequireFleetAdministrator` for account management and
   read-only Fleet Owner access to `GET /audit-log`; lists capped at 100;
   refresh tokens last 7 days; Development emails go to files, so no tokens
   reach the log. Both parts were rerun on Supabase afterwards and passed.
   These rules are also covered by `ApiRulesTests` (integration) and
   `PickupFolderEmailSenderTests` (unit).
9. **No server errors.** The API log had no `fail` entries or unhandled
   exceptions in any run.

## Not covered

- Token expiry over time (15-minute access token, 1-day / 30-day refresh
  session) and lockout ending after 15 minutes.
- File size and count limits (5 MB, 5 files) — covered by unit tests only.
- Real email delivery (Development logs emails instead of sending them).
- Web and mobile UI: the web sign-in form isn't connected to the API yet (KAN-220).

## Also covered by automated tests

- **Integration tests** (`apps/api/tests/FleetSync.IntegrationTests/Auth/`:
  `SessionFlowTests`, `StaffAndPasswordFlowTests`, `EerTablesTests`, `ApiRulesTests`) run the
  same flows in-process against the `fleetsync_test` database.
- **Unit tests** (`FleetSync.Modules.Auth.UnitTests`, 79 tests, all passing)
  cover validators and domain rules: application and profile-change states,
  token rotation, registration-number normalisation.

## Test data left in Supabase

Accounts and applications with emails `qa-<run id>-…@fleetsync.test` from the
test runs, including locked, deactivated and activated test users. Delete
them before using the Supabase project for demos. (The local test database was
thrown away after the run.)
