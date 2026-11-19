# FleetSync — Using a Supabase Database

## Purpose

**The team's development database is a shared Supabase project** (ADR-0003).
Production uses Azure Database for PostgreSQL instead; Supabase is for development only.
Supabase is used **only as PostgreSQL**. Sign-in, tokens and users are handled
by the FleetSync Auth module, not by Supabase Auth.

The API only needs a different connection string. No code changes are needed
to switch between local PostgreSQL and Supabase.

## Schemas

| Schema     | Owner                  | Contents                                             |
| ---------- | ---------------------- | ---------------------------------------------------- |
| `public`   | `FleetSyncDbContext`   | Shared baseline migration history                    |
| `identity` | Auth module            | Users, role subtypes, applications, profile changes, audit log, sessions, tokens |
| `orders`   | Orders module          | Transport orders, fare quotations, order history (tables arrive with the module's first migration) |

Supabase reserves several schemas for its own services, including `auth`,
`storage`, `realtime`, `extensions`, `graphql`, `vault` and `cron`. Never
create FleetSync tables in them. When a new module needs a schema, choose a
name that isn't on that list.

## 1. Get the connection details

1. Open the Supabase project dashboard and click **Connect**.
2. Choose **Session pooler** and note the host, port, database, user and region.

| Setting  | Value                                      |
| -------- | ------------------------------------------ |
| Host     | `aws-0-<region>.pooler.supabase.com`       |
| Port     | `5432`                                     |
| Database | `postgres`                                 |
| Username | `postgres.<project-ref>`                   |
| Password | The database password, not the API keys    |

Why the session pooler:

- The **direct connection** (`db.<project-ref>.supabase.co`) needs IPv6, which
  many home and office networks lack.
- The **transaction pooler** (port `6543`) shares connections between
  transactions. That breaks EF Core migrations and anything that keeps
  session state, so don't use it.

If you forgot the database password, reset it under
**Project Settings → Database**.

## 2. Configure the API

Store the connection string in User Secrets. Never commit it to
`appsettings` files.

```
dotnet user-secrets set "ConnectionStrings:FleetSyncDatabase" "Host=aws-0-<region>.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=<db-password>;SSL Mode=Require;Maximum Pool Size=10" --project apps/api/src/FleetSync.Api
```

- `SSL Mode=Require`: Supabase only accepts encrypted connections.
- `Maximum Pool Size=10`: Supabase limits connections per project, and each
  running API instance opens its own pool. Lower it if several teammates share
  one project.
- If the password contains `;` or `=`, wrap it in single quotes:
  `Password='p;ss=word'`.

Also set the Auth module secrets (JWT signing key, optional dev admin) as
described in [auth-module.md](auth-module.md).

## 3. Apply migrations

The EF Core tools read the connection string from an environment variable,
not from User Secrets. Set it only for the current terminal session:

```
export ConnectionStrings__FleetSyncDatabase="<same connection string as above>"

dotnet ef database update --project apps/api/src/FleetSync.Infrastructure --startup-project apps/api/src/FleetSync.Api --context FleetSyncDbContext

dotnet ef database update --project apps/api/src/Modules/Auth/FleetSync.Modules.Auth --startup-project apps/api/src/FleetSync.Api --context AuthDbContext

dotnet ef database update --project apps/api/src/Modules/Orders/FleetSync.Modules.Orders --startup-project apps/api/src/FleetSync.Api --context OrdersDbContext

unset ConnectionStrings__FleetSyncDatabase
```

On Windows PowerShell, use `$env:ConnectionStrings__FleetSyncDatabase = "..."`
and `Remove-Item Env:ConnectionStrings__FleetSyncDatabase` instead.

The team's Supabase project is a **shared database** (ADR-0003):

- Apply migrations to it **only from `main`**, after the pull request is merged.
- Only **Thamod, Senuth or Prasad** run `database update` here.
- Never apply a migration from a feature branch: if that branch changes before merging, everyone's database is left
  with a migration `main` doesn't know about.

## 4. Verify

Run the API and open `http://localhost:5215/health/ready`.

- `Healthy`: both database contexts can reach Supabase.
- `Unhealthy`: check the host, user (`postgres.<project-ref>`), password and
  `SSL Mode`.

The Supabase **Table Editor** shows the FleetSync tables under the
`identity` schema.

## 5. Lock down the Supabase Data API

Supabase can expose tables over a public REST/GraphQL API (the "Data API"),
reachable with the project's public `anon` key. FleetSync doesn't use it; all
access goes through the FleetSync API.

- Under **Project Settings → Data API**, turn the Data API off. If it must
  stay on, make sure `identity` is **not** in the exposed schemas list.
- Never share the `service_role` key. FleetSync doesn't need any Supabase API
  key, only the database password.

## 6. Shared test accounts (one per role)

The shared database holds one ready-to-use account per role, so everyone can
try the web and mobile sign-in without going through registration and approval.
All six share one password, which is **not** in the repo: ask Prasad for it.

| Role | Email | Sign in on |
| ---- | ----- | ---------- |
| Fleet Owner | `owner@fleetsync.local` | Web |
| Fleet Administrator | `admin@fleetsync.local` | Web |
| Operational Coordinator | `coordinator@fleetsync.local` | Web |
| Customer | `customer@fleetsync.local` | Web |
| Driver | `driver@fleetsync.local` | Mobile |
| Mechanic | `mechanic@fleetsync.local` | Mobile |

**Using them** needs nothing extra: point your API at Supabase (section 2) and
sign in. Because everyone shares these accounts:

- **Don't change their passwords** (Profile → Change password, or a reset): it
  changes them for the whole team and signs everyone else out.
- **Don't guess the password.** Five wrong attempts lock the account for 15
  minutes for everybody.
- Don't deactivate them or approve/reject real applications as the test admin
  unless that is what you are testing.

**Creating them** is done once, by one person (Prasad). `DevTestAccountsSeeder`
runs at API startup in Development only, and only when
`Auth:DevTestAccounts:Password` is set:

```bash
dotnet user-secrets set "Auth:DevTestAccounts:Password" "<strong shared password>" --project apps/api/src/FleetSync.Api
dotnet run --project apps/api/src/FleetSync.Api
```

The log shows `Created development test account … (role)` for each new account.
Emails that already exist are skipped, so the password is set by whoever seeds
first and running it again never resets it. Everyone else should **leave
`Auth:DevTestAccounts:Password` unset**. (If the test customer is skipped with
a warning, another company already uses registration number `PV 00001`.)

Rules for the shared password:

- Use a strong one (not the `FleetSync@2026` example from
  [auth-module.md](auth-module.md)): the list includes a Fleet Administrator.
- Share it privately with the team. Never commit it or post it in an issue or PR.
- Never set it on an API that is reachable from the internet. On a hosted
  environment pointing at this database, anyone could sign in as the admin.
  (Production uses Azure and is not in Development, so the seeder never runs there.)

To reset a forgotten or changed password, use **Forgot password** with that
email; the link is saved under `App_Data/dev-emails/` on the machine running the
API that sent it.

## Tests

Integration tests write data, so they only run against databases named
`fleetsync_test` or `fleetsync_ci`. A Supabase database is named `postgres`,
so the tests refuse to run against it. This is deliberate. Run integration
tests against local PostgreSQL (see
[database-testing.md](database-testing.md)) or rely on the CI `database` job.

## Safety rules

- Never commit the database password or a Supabase connection string.
- Each developer stores their own connection string in User Secrets.
- Supabase is for development only. Production runs on Azure Database for
  PostgreSQL, with its own credentials and approved migration process.
- Don't create FleetSync tables in Supabase-reserved schemas.
