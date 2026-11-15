# FleetSync API — guide for Claude Code

FleetSync is a fleet management system (team devSync, IN2901 Software Development Project).
This folder is the **backend**: one ASP.NET Core API, built as a modular monolith, serving the web app
(`apps/web`: Customer, Operational Coordinator, Fleet Administrator, Fleet Owner) and the mobile app
(`apps/mobile`: Driver, Mechanic).

Before you change anything, look at the current code: the notes below describe the repo as of late October 2026,
and teammates may have added modules since. Follow what already exists over what this file guesses.

## Design sources — read these before building a feature

| File | What it gives you |
|---|---|
| `docs/design/use-cases.md` | Who does what. Every endpoint should serve a use case listed there. |
| `docs/design/data-model.md` | The EER: entities, attributes, relationships with cardinalities, status values, proposed table mapping. |
| `docs/design/class-diagram.md` | The UML class diagram: domain behaviour, and how it maps to the layers here. |
| `docs/design/design-issues.md` | **Known conflicts** between the diagrams, the requirements, the auth contract, the UI and the code (`DI-xx`). |
| `docs/design/figma-screens.md` | Every screen, with a Figma link. Use it to see which fields a screen sends and shows. |
| `docs/adr/` | Decisions already made. These win over everything else. |

Two more documents are kept outside the repo: the **Requirements Analysis & Refinement Document** (IDs such as
`FR-TRIP-004`, `BR-18`, `OI-24`) and the **Authentication API Contract** (endpoints, JWT, roles, error codes; IDs such as `OD-02`).
If the developer gives you either one, use it. Both are drafts: only items marked *Confirmed* are agreed.

### Which source wins

1. An ADR in `docs/adr/`, or a row marked **Decided** in `design-issues.md`.
2. The code that is already merged, when it is deliberate.
3. Items marked *Confirmed* in the Authentication API Contract (for identity and auth) or the requirements document.
4. The diagrams in `docs/design/`.
5. Items marked *Proposed*, *Pending Validation* or *Open* — use them as defaults only, behind a setting or in one place that is easy to change.

### When sources disagree — the rule

Never resolve a conflict quietly in code. When the task touches something the sources disagree on:

1. Check `design-issues.md`. If the conflict is listed and still **Open**, follow its *proposed default*, tell the developer
   you did, and name the issue ID (for example "follows DI-08 default") in your summary.
2. If it is not listed, **stop and tell the developer**: what disagrees, where, and the fix you suggest. Add a new
   `DI-xx` row once they agree.
3. When code ends up differing from a diagram, update the matching text file in `docs/design/` in the same change:
   the entity or relationship in `data-model.md`, the class in `class-diagram.md`, the status of the issue in
   `design-issues.md`. Then tell the developer which drawings (draw.io / FigJam) need the same edit, because you cannot edit them.
4. A decision that affects more than one module (key types, naming, endpoint style, status values) needs an ADR in
   `docs/adr/` (next number after the existing ones). Draft it and let the developer and team approve it.

## Stack (in this repo — do not change without an ADR)

- **ASP.NET Core 10** Web API on .NET 10, the current LTS release (`global.json`; team decision, DI-28), OpenAPI via `Microsoft.AspNetCore.OpenApi`
- Entity Framework Core 10 with Npgsql, **PostgreSQL 18** (local: `compose.yaml`; password in the root `.env`)
- Health checks: `/health`, `/health/live`, `/health/ready` (database)
- Tests: xUnit — `tests/FleetSync.UnitTests`, `tests/FleetSync.IntegrationTests` (real PostgreSQL)
- Auth (per the Authentication API Contract): ASP.NET Core Identity + JWT Bearer, HS256, access token 15 min,
  refresh token 7 days in an HttpOnly cookie, rotated on use

The requirements document and the auth contract still say ASP.NET Core 8. Ignore that: the team decided on ASP.NET Core 10 (DI-28).
Never downgrade a package to an 8.x version because a document mentions 8.

## Solution layout (Clean Architecture)

```
apps/api/
├── FleetSync.slnx
├── src/
│   ├── FleetSync.Domain/          entities, value objects, enums, domain rules — no dependencies
│   ├── FleetSync.Application/     use cases (services / handlers), DTOs, validation, interfaces for outside systems → Domain
│   ├── FleetSync.Infrastructure/  EF Core (Persistence/), PayHere, email, push, file storage implementations → Application, Domain
│   └── FleetSync.Api/             endpoints, auth setup, ProblemDetails, OpenAPI, Program.cs → Application, Infrastructure
└── tests/
    ├── FleetSync.UnitTests/
    └── FleetSync.IntegrationTests/
```

Dependencies point inward only: Domain knows nothing else; Application never references EF Core, HTTP or a vendor SDK.

### Modules (modular monolith)

Each module has a folder with the same name in every layer that needs it, e.g. `FleetSync.Domain/Trips/`,
`FleetSync.Application/Trips/`, `FleetSync.Infrastructure/Persistence/Configurations/Trips/`, `FleetSync.Api/Trips/`.

| Module folder | Covers | Requirements module | Owner |
|---|---|---|---|
| `Identity` | Registration, login, tokens, accounts, roles, applications, profile change requests | M01 | Prasad |
| `Audit` | Audit log | M01 | Prasad |
| `Fleet` | Vehicles, driver profiles, odometer readings, service types | M02 | not assigned (OI-27) |
| `Customers` | Customer companies | M03 | Dissanayake |
| `Orders` | Transport orders, fare quotations | M04 | Dissanayake, Prasad |
| `Trips` | Trips, assignment, driver trip execution, trip notes, proof of delivery | M05, M06 | Idusara, Welihena |
| `Availability` | Vehicle and driver availability | M07 | Idusara |
| `Maintenance` | Maintenance logs, schedules, vehicle issues | M08 | Arawindi |
| `Notifications` | Email, in-app and push notifications | M09 | Welihena, Arawindi |
| `Chat` | Conversations and messages | team extension | Welihena |
| `Mail` | Internal mail | team extension | — |
| `Documents` | File upload, storage, verification | M10 | Arawindi |
| `Payments` | PayHere payments, refunds, invoices | team extension | Dissanayake |
| `Dashboards` | Role dashboards | M11 | Prasad and role owners |
| `Reports` | Reports and exports | M12 | Idusara |

Modules talk to each other through Application-layer interfaces or domain events, never by editing another module's
tables directly. One `FleetSyncDbContext` holds all entities; each module adds its own `IEntityTypeConfiguration<T>`
classes, which the context already picks up with `ApplyConfigurationsFromAssembly`.

## Data and EF Core rules

- Every model change comes with a migration in the same change. CI fails on missing migrations
  (`dotnet ef migrations has-pending-model-changes`). Commands: `docs/runbooks/database-migrations.md`.
- Never edit a migration that is already on `main`; add a new one.
- Use the proposed defaults in `design-issues.md` until decided, in particular:
  GUID keys (DI-05), `decimal(18,2)` LKR for money (DI-27), enums stored as strings (DI-14),
  ASP.NET Core Identity for users (DI-03).
- All times in UTC (`DateTimeOffset` / `timestamptz`).
- No hard deletes of vehicles, users, trips or maintenance records: deactivate or retire them.
- If table and column naming is not settled yet, propose it in an ADR before the first module's tables are added.

## API rules

- REST, JSON in camelCase, ISO 8601 UTC dates, routes under `/api/<module>/...`.
- Errors as RFC 9457 Problem Details with `errorCode` and `traceId`; no stack traces outside Development.
- Lists are paginated: default 20, maximum 100.
- Deny by default: every endpoint requires an authenticated user unless marked anonymous, and declares its roles with the
  shared policies from the auth contract (`RequireFleetOwner`, `RequireFleetManagement`, `RequireOperations`, `RequireStaff`,
  `RequireDriver`, `RequireMechanic`, `RequireCustomer`). Do not define new role lists under those names.
- **Account management is Fleet Administrator only** (DI-01, DI-02): creating accounts, reviewing applications, approving,
  rejecting, suspending and changing roles. This overrides the auth contract, which gives staff creation and approval to the
  Fleet Owner. Use a dedicated policy (e.g. `RequireFleetAdministrator`) for these endpoints. This covers **customer
  accounts too**: after email verification a customer stays PENDING (AWAITING_APPROVAL) until a Fleet Administrator approves.
- **The Fleet Owner is read-only everywhere.** Fleet Owner access is limited to GET endpoints (dashboards, analysis, reports,
  audit trail, exports). Never include FleetOwner in a policy that guards a create, update, delete or approval endpoint.
- Check ownership in the query, not only the role: a Driver sees only their own trips; a Customer sees only their own
  company's records, taking the company from the token, never from the request; another company's record returns 404.
- Business rules live in the backend (Domain or Application), never only in the UI. Examples: allowed status
  transitions, no double booking of a driver or vehicle, odometer readings never decrease.
- Every endpoint appears in OpenAPI with request and response types. The frontends generate or copy types from it.
- If an endpoint style (controllers or minimal APIs) already exists, follow it; if not, ask before choosing.

## Scope rules

- The use cases are the scope. Do not add features that are not in `use-cases.md`; flag them instead.
- **No GPS, live map, ETA, telematics or IoT** anywhere.
- The coordinator assigns a vehicle, a driver and a mechanic per trip; a driver is never tied to one vehicle.
- Fleet Owner endpoints are read-only.
- In scope by team decision, even though the requirements draft lists them as "won't have": **chat, payments, the mobile app
  and the internal mail system** (DI-21, DI-22, DI-23, DI-25). Build them; do not flag them as out of scope.
- Trip cancellation (DI-06): allowed while the trip is Draft, Assigned or In Progress, **but only until the driver has picked
  up the cargo**. Once `cargo_picked_up_at` is set, refuse cancellation. Enforce this in the backend, not only in the UI.
- Payments: card only, through PayHere. Cancelling an Assigned or In Progress trip that has a successful payment starts an
  automatic full refund (DI-06, DI-22).
- Chat pairs allowed: Customer ↔ Coordinator, Coordinator ↔ Driver, Coordinator ↔ Mechanic, Driver ↔ Mechanic (DI-21).
- Never put passwords, NIC numbers or tokens in logs, JWTs or notifications.

## Tests

- Unit tests for domain rules and Application services in `FleetSync.UnitTests`.
- Integration tests for anything that depends on the database (constraints, concurrency, migrations) in
  `FleetSync.IntegrationTests`, against PostgreSQL (`docs/runbooks/database-testing.md`).
- Add tests with every rule you implement, including the failure cases (wrong role, wrong owner, invalid transition).

## Commands

```
docker compose up -d                                   # local PostgreSQL (from the repo root)
dotnet build apps/api/FleetSync.slnx
dotnet test apps/api/tests/FleetSync.UnitTests
dotnet test apps/api/tests/FleetSync.IntegrationTests  # needs the database
dotnet run --project apps/api/src/FleetSync.Api
```

## Working with the developer

- Show a short plan before writing code for a new feature: entities touched, endpoints, migrations, and any `DI-xx` involved.
- Leave git to the developer: do not create branches, commit, push or open pull requests unless asked.
- When you finish, list what changed, which design files you updated, and any open issue the work depends on.
