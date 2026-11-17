# FleetSync — Database Integration Testing

## Purpose

Integration tests verify FleetSync's EF Core
integration against PostgreSQL 18.

## Database environments

- Supabase (`postgres`): shared team development (ADR-0003). **Never used by tests.**
- fleetsync_test: Optional local integration tests (Docker or a native PostgreSQL)
- fleetsync_ci: Temporary GitHub Actions tests

Never run integration tests against Supabase or production (Azure). The tests refuse any database not named
`fleetsync_test` or `fleetsync_ci`.

## Where the tests run

- **CI (always):** the `database` job runs them on every pull request.
- **Locally (optional):** only if you have a local PostgreSQL.

## Local setup (optional)

1. Start a local PostgreSQL (`docker compose up -d` from the repo root, or a native install).
2. Create the fleetsync_test database if missing.
3. Configure ConnectionStrings\_\_FleetSyncDatabase
   for the test database in the terminal.
4. Run the IntegrationTests project.
5. Remove the temporary environment variable.

## CI validation

The database CI job:

1. Starts a PostgreSQL 18 service.
2. Builds the .NET solution.
3. Executes EF Core migrations against fleetsync_ci.
4. Verifies migration history and pending migrations.
5. Checks every module's model against its migration snapshot.

## Safety rules

- Do not use production credentials in tests.
- Do not point tests at the shared Supabase database.
- Do not delete development databases in test code.
- Keep migration tests isolated from business data.
- Do not silently skip failed database tests.
- Never commit real connection strings.
