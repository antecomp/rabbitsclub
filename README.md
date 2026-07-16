# RABBITS.CLUB
<img src="apps/client/src/assets/misc/brand.svg" alt="logo" width="400"/>

RABBITS.CLUB is a chat SPA monorepo built with Bun workspaces. It includes a Solid/Vite frontend and an Elysia API server backed by SQLite.

## Development

Install dependencies from the repository root:

```bash
bun install
```

Create local environment files from the committed templates:

```bash
cp apps/client/.template.env apps/client/.env
cp apps/server/.template.env apps/server/.env
```

The default development ports are:

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`

Run both workspaces in watch mode:

```bash
bun run dev
```

Or run them separately:

```bash
bun run dev:server
bun run dev:client
```

The server auto-applies pending migrations on startup. Unless `DB_PATH` is set, the development SQLite database is created at `apps/server/chat.db`.

### Development Environment

`apps/client/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

`apps/server/.env`:

```bash
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
AUTH_ALLOWED_ORIGINS=http://localhost:5173
AUTH_ENFORCE_ORIGIN_CHECK=true
JWT_SECRET=your-long-random-secret-here
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
SEED_ADMIN=false
INITIAL_ADMIN_USERNAME=R46617
INITIAL_ADMIN_PASSWORD=12345678
```

Use a long random `JWT_SECRET` for local development too:

```bash
openssl rand -base64 48
```

Set `SEED_ADMIN=true` only when you need to create or reset the initial admin account. The server requires `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` when seeding is enabled, and it upserts that user as an admin on startup.

Optional server environment variables:

- `DB_PATH`: override the SQLite database file path.
- `MIGRATIONS_PATH`: override the migrations directory path.

### Commands

Root workspace commands:

| Command | Description |
| --- | --- |
| `bun run dev` | Run every workspace's `dev` script. |
| `bun run dev:server` | Run the server dev watcher. |
| `bun run dev:client` | Run the client Vite dev server. |
| `bun run build` | Build every workspace. |
| `bun run build:server` | Typecheck and build the server. |
| `bun run build:client` | Typecheck and build the client. |

Client commands from `apps/client`:

| Command | Description |
| --- | --- |
| `bun run dev` | Start the Vite dev server. |
| `bun run build` | Run `tsc -b` and build the Vite app. |
| `bun run preview` | Serve the built client locally with Vite preview. |

Server commands from `apps/server`:

| Command | Description |
| --- | --- |
| `bun run dev` | Start the Elysia API with Bun watch mode. |
| `bun run typecheck` | Run TypeScript without emitting files. |
| `bun run build` | Typecheck and bundle `src/index.ts` to `dist`. |
| `bun run db:generate` | Generate Drizzle migrations from schema changes. |
| `bun run db:migrate` | Apply Drizzle migrations using `drizzle.config.ts`. |
| `bun run db:studio` | Open Drizzle Studio for the configured SQLite database. |


---


## Production Environment

Production deploys should use a root `.prod.env` file. Copy the committed example and replace the placeholder values:

```bash
cp .prod.env.example .prod.env
```

Required values:

```bash
NODE_ENV=production
PORT=3000
CLIENT_ORIGIN=https://example.com
AUTH_ALLOWED_ORIGINS=https://example.com,https://anotherexample.com
AUTH_ENFORCE_ORIGIN_CHECK=true
VITE_API_URL=https://api.example.com
JWT_SECRET=replace-with-long-random-secret
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
DB_PATH=/var/lib/rabbitclub/chat.db
# this is usually going to reflect the directory you cloned into
MIGRATIONS_PATH=/opt/rabbitclub/apps/server/migrations
SEED_ADMIN=false
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=replace-only-for-first-seed
```

Use a long random `JWT_SECRET`, for example:

```bash
openssl rand -base64 48
```

Set `SEED_ADMIN=true` only for the first admin bootstrap or an intentional admin password reset. After the admin account works, set it back to `false` and remove the real admin password from `.prod.env`.

## Build

Install dependencies and build both workspaces:

```bash
bun install --frozen-lockfile
bun --env-file=.prod.env run build
```

The frontend build is written to `apps/client/dist`. The backend build is written to `apps/server/dist/index.js`.

## Caddy

Use one domain for the SPA and one for the API:

```caddyfile
example.com {
	root * /opt/rabbitclub/apps/client/dist
	try_files {path} /index.html
	file_server
	encode zstd gzip
}

api.example.com {
	reverse_proxy 127.0.0.1:3000
	encode zstd gzip
}
```

Point DNS for both domains at the server. Caddy will handle HTTPS certificates and WebSocket upgrades.

## systemd

Example service:

```ini
[Unit]
Description=Rabbitsclub Server
After=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/opt/rabbitclub
EnvironmentFile=/opt/rabbitclub/.prod.env
ExecStart=/home/deploy/.bun/bin/bun /opt/rabbitclub/apps/server/dist/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Create a dedicated deploy account, install Bun for that account, and keep the app checkout in `/opt`:

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /opt
sudo chown deploy:deploy /opt
sudo -iu deploy
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
git clone https://github.com/antecomp/rabbitsclub /opt/rabbitclub
cd /opt/rabbitclub
bun install --frozen-lockfile
```

Keep the production SQLite database outside the code checkout:

```bash
sudo mkdir -p /var/lib/rabbitclub
sudo chown deploy:deploy /var/lib/rabbitclub
```

After installing the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now rabbitclub
sudo systemctl status rabbitclub
```

View logs with:

```bash
journalctl -u rabbitclub -f
```

## Health Check

After Caddy and the service are running:

```bash
curl https://api.example.com/health
```

Expected response:

```json
{"status":"ok"}
```

## SQLite Data

For production, keep `DB_PATH` outside the repo, for example:

```bash
sudo mkdir -p /var/lib/rabbitclub
sudo chown deploy:deploy /var/lib/rabbitclub
```

Back up the SQLite database and WAL files together:

```bash
/var/lib/rabbitclub/chat.db
/var/lib/rabbitclub/chat.db-wal
/var/lib/rabbitclub/chat.db-shm
```
