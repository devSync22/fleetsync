## ASP.NET Core Database Configuration

> **Development uses the team's Supabase database** (ADR-0003). Follow
> [supabase-database.md](supabase-database.md) to connect to it.
>
> This page covers the **optional** local PostgreSQL (Docker Compose or a native install). You only need it to run
> the integration tests on your own machine; see [database-testing.md](database-testing.md).

FleetSync uses Entity Framework Core with the Npgsql PostgreSQL provider.

### Local connection settings

- Host: `127.0.0.1`
- Port: `5432`
- Database: `fleetsync_dev` (development) or `fleetsync_test` (integration tests)
- Username: `fleetsync`
- Password: The local PostgreSQL password configured through Docker Compose (root `.env`)

### Configure API User Secrets

Initialize User Secrets for `FleetSync.Api` if they are not already enabled.

Configure the secret key:

`ConnectionStrings:FleetSyncDatabase`

Its value must be a valid PostgreSQL connection string. Normally it points at Supabase; point it at the local
database only while you work locally.

Do not store real passwords in tracked application configuration files.

### Run the API

If you use the local database, start it with `docker compose up -d` (from the repo root) or start your native install.

Run `FleetSync.Api` in the `Development` environment so that ASP.NET Core loads local User Secrets.

The `/health` endpoint confirms basic application availability. Database connectivity is verified separately.

### Notes

- Each developer configures their own secrets.
- With Docker, the `.env` file and ASP.NET Core User Secrets must use matching database credentials.
- Production (Azure Database for PostgreSQL) credentials are supplied through the host's secure configuration.
- Database migrations are managed through EF Core tooling.

### API Database Health Checks

FleetSync exposes separate liveness and readiness endpoints.

| Endpoint | Purpose |
|---|---|
| `GET /health` | Basic API liveness |
| `GET /health/live` | Explicit API liveness |
| `GET /health/ready` | PostgreSQL database connectivity (every module's `DbContext`) |

When PostgreSQL is available, `/health/ready` returns HTTP 200.

When PostgreSQL cannot be reached, `/health/ready` returns HTTP 503.

To verify recovery during local development:

1. Start the API and PostgreSQL.
2. Confirm `/health/ready` returns Healthy.
3. Stop PostgreSQL (for Docker: `docker compose stop postgres`).
4. Confirm `/health/ready` returns Unhealthy while `/health/live` remains Healthy.
5. Restart PostgreSQL and confirm readiness returns Healthy.

These checks validate database connectivity, not application schema or migration state.

Do not expose connection strings, credentials or detailed database errors in public health responses.
