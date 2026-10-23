
# ADR-0001: Monorepo Strategy

Status: Accepted
Date: 2026-10-23

## Context

FleetSync consists of a web application,
a mobile application, and an ASP.NET Core API.

Five developers will work on related features
that frequently require changes across applications.

## Decision

Use one GitHub monorepo with independently
runnable applications:

- apps/web
- apps/mobile
- apps/api

Shared TypeScript code and API contracts
will be managed explicitly.

## Consequences

Advantages:
- Coordinated full-stack pull requests
- Easier API contract synchronization
- Centralized code review and CI

Trade-offs:
- Larger combined repository
- More complicated build configurations
- Potential conflicts in shared files

## Development Rules

- Short-lived feature branches
- Pull requests into main
- At least one peer review
- Automated validation before merging
- Independent application build pipelines
