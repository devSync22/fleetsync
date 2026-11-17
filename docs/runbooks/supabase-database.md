# FleetSync — Using a Supabase Database

## Purpose

FleetSync can use a Supabase project as its hosted PostgreSQL database.
Supabase is used **only as PostgreSQL**. Sign-in, tokens and users are handled
by the FleetSync Auth module, not by Supabase Auth.

The API only needs a different connection string. No code changes are needed
to switch between local PostgreSQL and Supabase.

## Schemas

| Schema     | Owner                  | Contents                                             |
| ---------- | ---------------------- | ---------------------------------------------------- |
| `public`   | `FleetSyncDbContext`   | Shared baseline migration history                    |
| `identity` | Auth module            | Users, role subtypes, applications, profile changes, audit log, sessions, tokens |

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

unset ConnectionStrings__FleetSyncDatabase
```

On Windows PowerShell, use `$env:ConnectionStrings__FleetSyncDatabase = "..."`
and `Remove-Item Env:ConnectionStrings__FleetSyncDatabase` instead.

A Supabase project used by the team is a **shared database**. As
[database-migrations.md](database-migrations.md) says, agree on who applies
migrations before running `database update` against it.

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

## Tests

Integration tests write data, so they only run against databases named
`fleetsync_test` or `fleetsync_ci`. A Supabase database is named `postgres`,
so the tests refuse to run against it. This is deliberate. Run integration
tests against local PostgreSQL (see
[database-testing.md](database-testing.md)) or rely on the CI `database` job.

## Safety rules

- Never commit the database password or a Supabase connection string.
- Each developer stores their own connection string in User Secrets.
- Use a separate Supabase project for production, with its own password and
  approved migration process.
- Don't create FleetSync tables in Supabase-reserved schemas.
