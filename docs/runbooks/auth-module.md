# FleetSync — Auth Module (backend)

## Purpose

The Auth module (`apps/api/src/Modules/Auth/FleetSync.Modules.Auth`) handles:

- sign-in, sessions and sign-out
- user applications (customers and staff), email verification and review
- staff account activation
- profile change requests that an administrator approves
- deactivating / reactivating accounts
- password reset
- the audit log of security events

It is a self-contained module of the modular monolith. See
[ADR-0002](../adr/0002-modular-monolith-modules.md).

## Structure

| Folder            | Contents                                                              |
| ----------------- | --------------------------------------------------------------------- |
| `Domain/`         | Entities and rules (`ApplicationUser`, `UserApplication`, role subtypes, `ProfileChangeRequest`, `AuditLogEntry`, tokens) |
| `Application/`    | One folder per flow: request/response contracts, validators, service  |
| `Infrastructure/` | `AuthDbContext` (schema `identity`), JWT, email, document storage, seeding |
| `Endpoints/`      | Minimal API routes under `/api/auth`                                  |
| `AuthModule.cs`   | The only public entry points: `AddAuthModule()` and `MapAuthEndpoints()` |

Everything except `AuthModule` is `internal`, so other modules can't depend
on Auth internals.

## Database tables (schema `identity`)

The tables follow the EER diagram. Identity's own tables (`Roles`, `UserRoles`,
`UserClaims`, …) and the token tables are kept alongside.

| EER entity               | Table                      | Notes |
| ------------------------ | -------------------------- | ----- |
| USER                     | `Users`                    | Identity user + `FullName`, `IsActive` (default true), `CreatedAt`, `UpdatedAt`, `LastSignInAt`. Email is unique. |
| FLEET_ADMINISTRATOR      | `FleetAdministrators`      | `UserId` PK → `Users` |
| CUSTOMER                 | `Customers`                | `UserId` PK, `CompanyId` → `CustomerCompanies` (nullable) |
| CUSTOMER_COMPANY         | `CustomerCompanies`        | One row per business registration number; contacts share it |
| OPERATIONAL_COORDINATOR  | `OperationalCoordinators`  | `UserId` PK |
| DRIVER                   | `Drivers`                  | `UserId` PK, `LicenceNumber` unique, `LicenceClass`, `LicenceExpiry` |
| MECHANIC                 | `Mechanics`                | `UserId` PK |
| FLEET_OWNER              | `FleetOwners`              | `UserId` PK |
| USER_APPLICATION         | `UserApplications`         | All roles except Fleet Administrator. `ReviewedByUserId` → `FleetAdministrators`, `UserId` → `Users` (unique) |
| PROFILE_CHANGE_REQUEST   | `ProfileChangeRequests`    | `ApprovedByUserId` → `FleetAdministrators`; one pending request per user and field |
| AUDIT_LOG                | `AuditLog`                 | `Action` e.g. `LOGIN`, `LOGOUT`, `LOGIN_FAILED`; `UserId` → `Users` |
| *(not in EER)*           | `ApplicationDocuments`, `RefreshTokens` (sessions, with IP and user agent), `OneTimeTokens` (password reset), `PasswordHistory` | |

Each user has exactly one role. A unique index on `UserRoles.UserId` enforces
this, and the role's subtype row is written in the same transaction
(`RoleAssignment`).

## Application lifecycle

- **Customer**: `POST /register/customer` → verify email → a Fleet
  Administrator approves → the account is created with the password chosen at
  registration and the customer can sign in. Signing in before approval returns
  `auth.email_not_verified` or `auth.pending_approval` (only when the password
  is right).
- **Staff** (driver, mechanic, coordinator, owner): `POST /staff-applications`
  → approve → activation email → `POST /activation` creates the account.
- Fleet Administrators are never applied for. In Development the dev seeder
  creates one; elsewhere an operator creates them.

## Local setup

1. Set up a database and `ConnectionStrings:FleetSyncDatabase`:
   - local PostgreSQL: [local-database.md](local-database.md)
   - Supabase: [supabase-database.md](supabase-database.md)

2. Set the JWT signing key in User Secrets. It must be at least 32 characters,
   and the API refuses to start without it.

   `dotnet user-secrets set "Auth:Jwt:SigningKey" "<random 64+ characters>" --project apps/api/src/FleetSync.Api`

   One way to generate a key is `openssl rand -base64 48`.

3. Optional: create a development Fleet Administrator so you can review staff
   applications. This only runs in the `Development` environment.

   `dotnet user-secrets set "Auth:DevAdmin:Email" "admin@fleetsync.local" --project apps/api/src/FleetSync.Api`
   `dotnet user-secrets set "Auth:DevAdmin:Password" "<password meeting the policy>" --project apps/api/src/FleetSync.Api`

4. Apply the Auth migrations. The command needs
   `ConnectionStrings__FleetSyncDatabase` set in the terminal.

   `dotnet ef database update --project apps/api/src/Modules/Auth/FleetSync.Modules.Auth --startup-project apps/api/src/FleetSync.Api --context AuthDbContext`

5. Run the API. In Development, emails are saved as text files in
   `apps/api/src/FleetSync.Api/App_Data/dev-emails/` instead of being sent
   (git-ignored; setting `Auth:Email:PickupDirectory`). Open the newest file to
   copy a verify, reset or activation link. The log shows only the recipient,
   subject and file name: links carry single-use tokens, which must never
   appear in logs.

## Endpoints

All routes are under `/api/auth`. In Development, browse and try them at
`http://localhost:5215/scalar` (Scalar UI); the raw contract is at
`/openapi/v1.json`, and sample requests are in `FleetSync.Api.http`.

| Method | Route                                     | Who        | Purpose                                   |
| ------ | ----------------------------------------- | ---------- | ----------------------------------------- |
| POST   | `/login`                                  | anyone     | Sign in (`email`, `password`, `rememberMe`) |
| POST   | `/refresh`                                | anyone     | New access token from the refresh token   |
| POST   | `/logout`                                 | anyone     | End the session                           |
| GET    | `/me`                                     | signed in  | Current user and roles                    |
| POST   | `/register/customer`                      | anyone     | Customer application (needs approval)     |
| POST   | `/verify-email`                           | anyone     | `{ token }` from the email link           |
| POST   | `/verify-email/resend`                    | anyone     | Always 202                                |
| POST   | `/staff-applications`                     | anyone     | multipart/form-data, field `documents`; role `driver`, `mechanic`, `coordinator` or `owner`; drivers may send `licenceExpiry` (yyyy-MM-dd) |
| GET    | `/applications?status=&role=&page=&pageSize=` | admin  | Review list (customers and staff)         |
| GET    | `/applications/{id}`                      | admin      | Details and documents                     |
| GET    | `/applications/{id}/documents/{documentId}` | admin    | Download a document                       |
| POST   | `/applications/{id}/approve`              | admin      | Customer: account created. Staff: activation link emailed |
| POST   | `/applications/{id}/reject`               | admin      | `{ reason }`                              |
| POST   | `/activation/lookup`                      | anyone     | Approval details for the activation screen |
| POST   | `/activation`                             | anyone     | `{ token, password }`                     |
| POST   | `/forgot-password`                        | anyone     | Always 202                                |
| POST   | `/reset-password/lookup`                  | anyone     | `{ token }` → `{ email }`                 |
| POST   | `/reset-password`                         | anyone     | `{ token, newPassword }`                  |
| POST   | `/profile-change-requests`                | signed in  | `{ field, newValue }`; field `full-name`, `phone`, `email`, or for drivers `licence-number`, `licence-class`, `licence-expiry` |
| GET    | `/profile-change-requests/mine`           | signed in  | The user's own requests                   |
| GET    | `/profile-change-requests?status=&page=&pageSize=` | admin | Review list, oldest first          |
| POST   | `/profile-change-requests/{id}/approve`   | admin      | Applies the change (not for your own account) |
| POST   | `/profile-change-requests/{id}/reject`    | admin      | `{ reason }`                              |
| PUT    | `/users/{id}/status`                      | admin      | `{ isActive }`; deactivating ends all sessions |
| GET    | `/audit-log?userId=&action=&page=&pageSize=` | admin   | Security events, newest first             |

"Admin" means the `fleet-administrator` role only (policy
`RequireFleetAdministrator`): account management is Fleet Administrator only
(DI-01, DI-02), and the EER's `reviewed_by` and `approved_by` columns reference
FLEET_ADMINISTRATOR. The read-only **Fleet Owner** may also call
`GET /audit-log` (policy `RequireAuditTrailReader`).

**Deny by default.** The host sets a fallback policy: every endpoint requires a
signed-in user unless it is marked `AllowAnonymous()`. The "anyone" rows above
are the anonymous ones, plus the health checks and, in Development, the
OpenAPI document and `/scalar`.

**Lists** default to 20 items per page; `pageSize` is capped at 100.

## Notes for frontend integration

**Access token.** Send it as `Authorization: Bearer <accessToken>`. It
expires after 15 minutes; refresh it before or when the API returns 401.

**Refresh token, web app.** The API sets an `HttpOnly`, `SameSite=Strict`
cookie scoped to `/api/auth`. JavaScript never sees the token. Call
`/refresh` and `/logout` with `credentials: 'include'` and no body.

**Refresh token, mobile app.** Send the header `X-Client-Type: mobile` on
`/login`, `/refresh` and `/logout`. The response then contains `refreshToken`;
store it in SecureStore. Without the header on `/refresh`, the rotated token is
set as a cookie instead and the app loses it.
Send it back as `{ "refreshToken": "…" }` to `/refresh` and `/logout`.

**Token rotation.** Every refresh returns a new refresh token and invalidates
the old one. Reusing an old token ends the whole session, so run only one
refresh at a time.

**Remember me.** The refresh token lasts 7 days either way (Authentication API
Contract). With `rememberMe: true` the cookie is persistent; otherwise it ends
when the browser closes.

**Enums.** Enums are kebab-case strings: roles (`driver`, `mechanic`,
`coordinator`, `customer`, `fleet-administrator`, `owner`), licence classes
(`light`, `light-lorry`, `heavy`, `heavy-trailer`), application statuses
(`pending`, `approved`, `rejected`, `activated`) and profile change statuses
(`pending`, `approved`, `rejected`).

**Errors.** Errors are RFC 9457 ProblemDetails, with a stable `errorCode` field
and a `traceId`:

| `errorCode`                          | Status | Notes                                     |
| ------------------------------------ | ------ | ----------------------------------------- |
| `validation_failed`                  | 400    | `errors` holds messages per field (camelCase) |
| `auth.invalid_credentials`           | 401    | `attemptsLeft` when the account exists    |
| `auth.locked_out`                    | 423    | `lockoutEnd`; 5 failures → 15 minutes     |
| `auth.email_not_verified`            | 403    |                                           |
| `auth.email_taken`                   | 409    |                                           |
| `auth.invalid_refresh_token`         | 401    | Sign in again                             |
| `auth.invalid_token`                 | 400    | Emailed link expired or already used      |
| `auth.password_reused`               | 400    | Same as one of the last 5 passwords       |
| `auth.password_rejected`             | 400    | Server-side password policy               |
| `auth.account_disabled`             | 403    | Account deactivated by an administrator   |
| `auth.pending_approval`              | 403    | Customer application not yet approved     |
| `application.duplicate`              | 409    | Open application with this email or NIC   |
| `application.invalid_document`       | 400    | File content is not a PDF or JPG          |
| `application.not_pending`            | 409    | Already reviewed                          |
| `application.email_not_verified`     | 409    | Customer hasn't verified their email yet  |
| `application.licence_taken`          | 409    | Another driver has this licence number    |
| `profile_change.duplicate`           | 409    | A pending request for this field exists   |
| `profile_change.field_not_allowed`   | 400    | e.g. a licence field for a non-driver     |
| `profile_change.no_change`           | 400    | Same as the current value                 |
| `profile_change.self_review`         | 403    | Admins can't review their own changes     |
| `user.cannot_deactivate_self`        | 400    |                                           |

**Password policy.** At least 8 characters, with an uppercase letter, a
lowercase letter and a number. The mobile activation checklist still needs a
lowercase line added.

## Before production

- Replace `PickupFolderEmailSender` with a real email provider.
- Replace `LocalDocumentStorage` with durable storage, or a mounted volume
  that is backed up.
- Supply `Auth:Jwt:SigningKey` from a secret store.
- Set `Cors:AllowedOrigins`, `Auth:Links:WebAppBaseUrl` and
  `Auth:Links:ActivationUrl` for the environment.
- If the API runs behind a reverse proxy, enable forwarded headers so rate
  limiting sees real client IPs.
