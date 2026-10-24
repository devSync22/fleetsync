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
