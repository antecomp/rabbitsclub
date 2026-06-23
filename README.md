# RABBITS.CLUB
<img src="apps/client/src/assets/misc/brand.svg" alt="logo" width="400"/>

bun workspace with a Solid/Vite client and an Elysia API server.

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
