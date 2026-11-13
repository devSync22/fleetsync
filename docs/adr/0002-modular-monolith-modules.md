# ADR-0002: Backend Modules

Status: Accepted
Date: 2026-11-13

## Context

The API is a modular monolith: one deployable application split into
business modules. Authentication is the first module.

## Decision

Each module lives in `apps/api/src/Modules/<Name>/FleetSync.Modules.<Name>`
and owns:

- its domain, application services and Minimal API endpoints, organised
  as folders inside the module project
- its own `DbContext`, PostgreSQL schema (for example `auth`) and
  migrations history table
- a single public entry point: `Add<Name>Module()` and `Map<Name>Endpoints()`

Everything else in a module is `internal`. When another module needs data
from a module, that module publishes a `FleetSync.Modules.<Name>.Contracts`
project. Modules never reference each other's internals or tables.

The host `FleetSync.Api` only composes modules and owns cross-cutting
concerns: ProblemDetails, CORS, JSON conventions, health checks and the
middleware order.

## Consequences

Advantages:
- Clear ownership, so teammates can work on separate modules with few conflicts.
- Schema-per-module keeps data boundaries explicit.
- A module can be extracted into its own service later.

Trade-offs:
- No cross-module joins. Data is shared through contracts instead.
- Each module needs its own `dotnet ef` commands (`--context <Name>DbContext`).
