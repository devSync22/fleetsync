## ASP.NET Core Database Configuration

FleetSync uses Entity Framework Core with the Npgsql PostgreSQL provider.

### Local connection settings

- Host: `127.0.0.1`
- Port: `5432`
- Database: `fleetsync_dev`
- Username: `fleetsync`
- Password: The local PostgreSQL password configured through Docker Compose

### Configure API User Secrets

Initialize User Secrets for `FleetSync.Api` if they are not already enabled.

Configure the secret key:

`ConnectionStrings:FleetSyncDatabase`

Its value must be a valid PostgreSQL connection string containing the local database credentials.

Do not store real passwords in tracked application configuration files.

### Run the API

Start PostgreSQL through Docker Compose.

Run `FleetSync.Api` in the `Development` environment so that ASP.NET Core loads local User Secrets.

The `/health` endpoint confirms basic application availability. Database connectivity is verified separately.

### Notes

- Each developer configures their own local secrets.
- The Docker `.env` file and ASP.NET Core User Secrets must use matching database credentials.
- Production credentials will be supplied through secure deployment configuration.
- Database migrations are managed through EF Core tooling.

### API Database Health Checks

FleetSync exposes separate liveness and readiness endpoints.

| Endpoint | Purpose |
|---|---|
| `GET /health` | Basic API liveness |
| `GET /health/live` | Explicit API liveness |
| `GET /health/ready` | PostgreSQL database connectivity |

The readiness endpoint uses the Entity Framework Core `FleetSyncDbContext` health check.

When PostgreSQL is available, `/health/ready` returns HTTP 200.

When PostgreSQL cannot be reached, `/health/ready` returns HTTP 503.

To verify recovery during local development:

1. Start the API and PostgreSQL.
2. Confirm `/health/ready` returns Healthy.
3. Stop PostgreSQL using `docker compose stop postgres`.
4. Confirm `/health/ready` returns Unhealthy while `/health/live` remains Healthy.
5. Restart PostgreSQL and confirm readiness returns Healthy.

These checks validate database connectivity, not application schema or migration state.

Do not expose connection strings, credentials or detailed database errors in public health responses.
