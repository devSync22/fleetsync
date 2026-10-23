
# FleetSync — Local Database Setup

## Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose

## Configuration

1. Open the repository root.
2. Copy `.env.example` to `.env`.
3. Set your local `POSTGRES_PASSWORD`.
4. Do not commit `.env`.

## Start Database

```bash
docker compose up -d postgres
```

## Check Status

```bash
docker compose ps
```

## Connect with psql

```bash
docker compose exec postgres psql \
  -U fleetsync -d fleetsync_dev
```

## Stop Database

```bash
docker compose down
```

Data is preserved in a Docker named volume.

## Database Connection Settings

Host: 127.0.0.1
Port: 5432
Database: fleetsync_dev
Username: fleetsync
Password: Value configured in local .env

## Important Notes

- Each developer has their own local database.
- Do not commit real credentials.
- Do not use `docker compose down -v` unless
  you intentionally want to remove local data.
- EF Core migrations will be introduced in
  FMS-002.3.
