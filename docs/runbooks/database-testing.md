# FleetSync — Database Integration Testing

## Purpose

Integration tests verify FleetSync's EF Core
integration against PostgreSQL 18.

## Database environments

- fleetsync_dev: Normal local development
- fleetsync_test: Local integration tests
- fleetsync_ci: Temporary GitHub Actions tests

Never run integration tests against production.

## Local setup

1. Start PostgreSQL using Docker Compose.
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
5. Checks the current model against the migration snapshot.

## Safety rules

- Do not use production credentials in tests.
- Do not delete development databases in test code.
- Keep migration tests isolated from business data.
- Do not silently skip failed database tests.
- Never commit real connection strings.
