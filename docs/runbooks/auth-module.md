# FleetSync — Auth Module (backend)

## Purpose

The Auth module (`apps/api/src/Modules/Auth/FleetSync.Modules.Auth`) handles:

- sign-in, sessions and sign-out
- customer registration and email verification
- staff applications and their review
- staff account activation
- password reset

It is a self-contained module of the modular monolith. See
[ADR-0002](../adr/0002-modular-monolith-modules.md).

## Structure

| Folder            | Contents                                                              |
| ----------------- | --------------------------------------------------------------------- |
| `Domain/`         | Entities and rules (`ApplicationUser`, `StaffApplication`, tokens)    |
| `Application/`    | One folder per flow: request/response contracts, validators, service  |
| `Infrastructure/` | `AuthDbContext` (schema `auth`), JWT, email, document storage, seeding |
| `Endpoints/`      | Minimal API routes under `/api/auth`                                  |
| `AuthModule.cs`   | The only public entry points: `AddAuthModule()` and `MapAuthEndpoints()` |

Everything except `AuthModule` is `internal`, so other modules can't depend
on Auth internals.

## Local setup

1. Start PostgreSQL and set `ConnectionStrings:FleetSyncDatabase` as described
   in [local-database.md](local-database.md).

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

5. Run the API. In Development, emails are written to the console log instead
   of being sent, so you can copy verify, reset and activation links from there.

## Endpoints

All routes are under `/api/auth`. In Development the full contract is at
`/openapi/v1.json`, and sample requests are in `FleetSync.Api.http`.

| Method | Route                                     | Who        | Purpose                                   |
| ------ | ----------------------------------------- | ---------- | ----------------------------------------- |
| POST   | `/login`                                  | anyone     | Sign in (`email`, `password`, `rememberMe`) |
| POST   | `/refresh`                                | anyone     | New access token from the refresh token   |
| POST   | `/logout`                                 | anyone     | End the session                           |
| GET    | `/me`                                     | signed in  | Current user and roles                    |
| POST   | `/register/customer`                      | anyone     | Customer company registration             |
| POST   | `/verify-email`                           | anyone     | `{ token }` from the email link           |
| POST   | `/verify-email/resend`                    | anyone     | Always 202                                |
| POST   | `/staff-applications`                     | anyone     | multipart/form-data, field `documents`    |
| GET    | `/staff-applications?status=&page=&pageSize=` | admin  | Review list                               |
| GET    | `/staff-applications/{id}`                | admin      | Details and documents                     |
| GET    | `/staff-applications/{id}/documents/{documentId}` | admin | Download a document                   |
| POST   | `/staff-applications/{id}/approve`        | admin      | Emails an activation link                 |
| POST   | `/staff-applications/{id}/reject`         | admin      | `{ reason }`                              |
| POST   | `/activation/lookup`                      | anyone     | Approval details for the activation screen |
| POST   | `/activation`                             | anyone     | `{ token, password }`                     |
| POST   | `/forgot-password`                        | anyone     | Always 202                                |
| POST   | `/reset-password/lookup`                  | anyone     | `{ token }` → `{ email }`                 |
| POST   | `/reset-password`                         | anyone     | `{ token, newPassword }`                  |

"Admin" means the `fleet-administrator` or `owner` role.

## Notes for frontend integration

**Access token.** Send it as `Authorization: Bearer <accessToken>`. It
expires after 15 minutes; refresh it before or when the API returns 401.

**Refresh token, web app.** The API sets an `HttpOnly`, `SameSite=Strict`
cookie scoped to `/api/auth`. JavaScript never sees the token. Call
`/refresh` and `/logout` with `credentials: 'include'` and no body.

**Refresh token, mobile app.** Send the header `X-Client-Type: mobile` on
`/login`. The response then contains `refreshToken`; store it in SecureStore.
Send it back as `{ "refreshToken": "…" }` to `/refresh` and `/logout`.

**Token rotation.** Every refresh returns a new refresh token and invalidates
the old one. Reusing an old token ends the whole session, so run only one
refresh at a time.

**Remember me.** With `rememberMe: true` the session lasts 30 days and the
cookie is persistent. Otherwise the session lasts 1 day and the cookie ends
when the browser closes.

**Enums.** Enums are kebab-case strings: roles (`driver`, `mechanic`,
`coordinator`, `customer`, `fleet-administrator`, `owner`), licence classes
(`light`, `light-lorry`, `heavy`, `heavy-trailer`) and statuses (`pending`,
`approved`, `rejected`, `activated`).

**Errors.** Errors are RFC 9457 ProblemDetails, with a stable `code` field
and a `traceId`:

| `code`                               | Status | Notes                                     |
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
| `staff_application.duplicate`        | 409    | Open application with this email or NIC   |
| `staff_application.invalid_document` | 400    | File content is not a PDF or JPG          |
| `staff_application.not_pending`      | 409    | Already reviewed                          |

**Password policy.** At least 8 characters, with an uppercase letter, a
lowercase letter and a number. The mobile activation checklist still needs a
lowercase line added.

## Before production

- Replace `LoggingEmailSender` with a real email provider.
- Replace `LocalDocumentStorage` with durable storage, or a mounted volume
  that is backed up.
- Supply `Auth:Jwt:SigningKey` from a secret store.
- Set `Cors:AllowedOrigins`, `Auth:Links:WebAppBaseUrl` and
  `Auth:Links:ActivationUrl` for the environment.
- If the API runs behind a reverse proxy, enable forwarded headers so rate
  limiting sees real client IPs.
