# ADR-0003: Database Environments

Status: Accepted
Date: 2026-11-17

## Context

The team first planned to develop against PostgreSQL in Docker (`compose.yaml`). The team has now decided to use a
hosted Supabase PostgreSQL database for development and Azure Database for PostgreSQL in production.

Every module uses EF Core with Npgsql and reads one connection string, `ConnectionStrings:FleetSyncDatabase`
(ADR-0002), so the choice of server is configuration, not code.

## Decision

| Environment | Database | Who uses it |
|---|---|---|
| Development | **Supabase PostgreSQL** (one shared team project, session pooler, port 5432) | Every developer's API and the web/mobile apps during development |
| Automated tests | PostgreSQL service started by the CI `database` job (`fleetsync_ci`) | GitHub Actions |
| Production | **Azure Database for PostgreSQL – Flexible Server** | The deployed system |

- **Supabase is used only as PostgreSQL.** FleetSync does not use Supabase Auth, Storage, Realtime, the Data API or
  row-level security, so moving to Azure stays a connection-string change.
- **Docker is optional.** `compose.yaml` stays in the repository for anyone who wants a local PostgreSQL, mainly to
  run the integration tests on their own machine. It is no longer needed for day-to-day development.
- **Integration tests never run against Supabase.** They write data, so they only accept databases named
  `fleetsync_test` or `fleetsync_ci` (`TestDatabase`), and Supabase's database is always `postgres`. They run in CI,
  or locally against a disposable PostgreSQL.
- **Migrations reach the shared Supabase database only from `main`**, applied only by **Thamod, Senuth or Prasad**,
  never from a feature branch. A migration that is on a feature branch exists only in that branch's code until it is merged.
- **Secrets**: each developer keeps the Supabase connection string in User Secrets. Production connection strings
  live in the Azure host's secret configuration. Neither is ever committed.
- **Schemas**: each module keeps its own schema (ADR-0002); none may use a Supabase-reserved name (`auth`, `storage`,
  `realtime`, `extensions`, `graphql`, `vault`, `cron`, …). Current schemas: `public` (baseline), `identity` (Auth).

## Consequences

Advantages:
- No local database to install; everyone sees the same development data.
- One provider (Npgsql) and one migration history per module for every environment.

Trade-offs:
- Developers share one database: a careless migration or seed affects everyone, hence the "only from `main`" rule.
- Supabase limits connections per project; keep `Maximum Pool Size` small in each developer's connection string.
- Running integration tests locally needs a disposable PostgreSQL (Docker or a native install); otherwise they run only in CI.
- **PostgreSQL versions must be checked.** The repo targets PostgreSQL 18 (CI and `compose.yaml`). The Supabase project
  and the Azure server must run a version that supports every feature the migrations use; check both versions and
  record them here before production.
