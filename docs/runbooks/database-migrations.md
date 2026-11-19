# FleetSync — Database Migration Workflow

## Purpose

FleetSync uses Entity Framework Core migrations to manage PostgreSQL database schema changes through version-controlled files.

## Architecture

- DbContext: `FleetSync.Infrastructure.Persistence.FleetSyncDbContext`
- Migration project: `FleetSync.Infrastructure`
- Startup project: `FleetSync.Api`
- Migration directory: `Persistence/Migrations`
- Database provider: Npgsql / PostgreSQL

### Module contexts

Each backend module has its own DbContext, schema and migrations history table.

| Module | DbContext        | Migration project                           | Schema | Migration directory                     |
| ------ | ---------------- | ------------------------------------------- | ------ | --------------------------------------- |
| Auth   | `AuthDbContext`  | `src/Modules/Auth/FleetSync.Modules.Auth`   | `identity` | `Infrastructure/Persistence/Migrations` |
| Orders | `OrdersDbContext` | `src/Modules/Orders/FleetSync.Modules.Orders` | `orders` | `Infrastructure/Persistence/Migrations` |

Always pass `--context` and the module's `--project` when running `dotnet ef`
for a module. Example:

`dotnet ef migrations add <Name> --project apps/api/src/Modules/Auth/FleetSync.Modules.Auth --startup-project apps/api/src/FleetSync.Api --context AuthDbContext --output-dir Infrastructure/Persistence/Migrations`

## Local prerequisites

- .NET 10 SDK
- Repository-local `dotnet-ef` tool
- No database is needed to **create** a migration (`migrations add` works with the design-time factories)
- To **apply** one: the team's Supabase database (only from `main`, ADR-0003) or an optional local PostgreSQL
- Valid database connection configured in API User Secrets
- `Development` environment configured

## Restore tools

Run from the repository root:

`dotnet tool restore`

## Generate a migration

After changing an approved entity or its EF Core configuration, use `dotnet ef migrations add` with the Infrastructure target project, API startup project and explicit DbContext.

Use a descriptive name such as `AddVehicleManagement`.

## Review the generated migration

Review:

1. The generated `Up()` operations.
2. The generated `Down()` operations.
3. Keys, foreign keys and indexes.
4. Nullable and non-nullable column changes.
5. Potential data loss.
6. The updated model snapshot.

## Apply locally

Run `dotnet ef database update` with Infrastructure as the target project and API as the startup project.

Never apply changes to a shared or production database without approval.

The shared Supabase development database receives migrations **only from `main`**, applied by **Thamod, Senuth or
Prasad** (ADR-0003). Production (Azure Database for PostgreSQL) follows its own approved deployment process.

## Check migration status

Use `dotnet ef migrations list` to inspect known migrations.

Use `dotnet ef migrations has-pending-model-changes` to detect model changes not represented by the latest migration.

## Team Rules

- Commit migration files with the feature that requires them.
- Never commit database credentials.
- Do not manually delete a migration's snapshot.
- Do not edit a migration already applied to shared environments.
- Avoid direct schema changes outside EF Core migrations.
- Review generated SQL before production deployment.
- Do not automatically apply migrations on API startup.

## Initial Baseline

`InitialBaseline` establishes the EF Core migration history without creating business tables.

Business tables will be added through feature-specific migrations.
