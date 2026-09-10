# The Dawn - Server

NestJS API for the air-defense investigation platform. Serves the `events`,
`finance` and `statistics` modules, with Swagger docs at `/api`.

Built on [NestJS](https://docs.nestjs.com). Target runtime: Node 22.

## Local development

```bash
npm install
npm run start:dev     # watch mode on http://localhost:3000
```

Swagger UI: http://localhost:3000/api

## Environment variables

All server variables live here; the frontend has its own set documented in
`the-dawn/README.md`. The app reads plain `process.env` - there is no
`ConfigModule` validation, so a missing variable silently falls back to the
default below.

### Database - required

Read by `src/app.module.ts` (TypeORM) and
`src/modules/database/database.module.ts` (the fallback DataSource).

| Variable | Image default | Must be set? | Notes |
| --- | --- | --- | --- |
| `DB_HOST` | `localhost` | **yes** | The default is wrong anywhere but your own machine - inside a container/pod `localhost` is the container itself. Use `host.docker.internal` against a Postgres on your Mac, or the Service / Cloud SQL proxy address in GKE. |
| `DB_USERNAME` | none (code falls back to `postgres`) | **yes** | |
| `DB_PASSWORD` | none (code falls back to `postgres`) | **yes** | GKE Secret - never bake it into the image. |
| `ENVIRONMENT` | unset | **yes** in prod/pre | `prod` or `pre` enables TLS (`rejectUnauthorized: false`). Any other value disables SSL. Leave unset locally. |
| `DB_PORT` | `5432` | only if different | Set in the Dockerfile. |
| `DB_NAME` | `hatzot` | only if different | Set in the Dockerfile. In source the two files disagree - `app.module.ts` falls back to `postgres`, `database.module.ts` to `hatzot` - so the image pins it and both connections land on the same database. Always set it explicitly when running outside Docker. |

Working local set, matching the loaded dump:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=hatzot
```

There is **no `DATABASE_URL` support** - a connection string on its own is
ignored, the six variables above are what the code reads.

The Postgres **schema is hard-coded to `hatzot`** in both files. Load it from
the DDL/DML dump (`hatzot_schema_v2 (2).sql` in the workspace root):

```bash
createdb -U postgres hatzot
psql "postgres://postgres:postgres@localhost:5432/hatzot" -f "hatzot_schema_v2 (2).sql"
```

That creates the `hatzot` schema with 9 tables (`interception`, `drone`,
`live_launcher`, `launcher_ammunition`, ...) and the sample rows. The script is
idempotent - re-running it drops and recreates the schema objects.

If the database is unreachable the app still boots: `DatabaseModule` logs
`DB unavailable, falling back to JSON` and the repositories serve
`src/modules/database/mocks/*.json` through `withFallback()`.

### Runtime

| Variable | Image default | Must be set? | Notes |
| --- | --- | --- | --- |
| `PORT` | `3000` | only if different | Set in the Dockerfile; the code reads `process.env.PORT ?? 3000`. No ConfigMap entry needed to run on 3000. |
| `NODE_ENV` | `production` | no | Set in the Dockerfile. |

`EXPOSE 3000` in the Dockerfile is documentation only - it publishes nothing.
What routes traffic is `-p` locally and `containerPort` / the Service in GKE.

### AI analysis - required

| Variable | Default | Must be set? | Notes |
| --- | --- | --- | --- |
| `LOGFARE_API_KEY` | unset | **yes** | LLM API key for `https://logfare.ai/v1`, used by `AiService` for the `/ai-analysis` endpoint. Despite the name it is not a logging key. **The app throws `LOGFARE_API_KEY is not configured` and exits on boot without it** - in GKE that is a CrashLoopBackOff, not a degraded feature. Supplied separately by the DS team; provide it as a Secret and never commit the value. Note the spelling is `LOGFARE_`, not `LOGFLARE_`. |
| `HTTPS_PROXY` | unset | in the closed network | `ai.service.ts` passes it to undici's `ProxyAgent` for the outbound call to logfare.ai. Without it the AI request goes direct, which fails wherever egress requires the proxy. Logged at boot as `Using proxy` / `Using direct connection`. |

Copy the names into a local `.env` (git-ignored) when running outside Docker.

## Docker

### Build

```bash
docker build -t the-dawn-server:local .
```

Multi-stage: `node:22-alpine` compiles with `nest build`, the runtime stage
installs production dependencies only and runs as the non-root `node` user
(GKE `runAsNonRoot` friendly).

### Run locally

Against a Postgres on the host - on Docker Desktop, reach it via
`host.docker.internal`:

```bash
docker run --rm -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=hatzot \
  the-dawn-server:local
```

`DB_HOST` has to be overridden: the image defaults to `localhost`, which inside
the container means the container itself, not your Mac.

Without a database it still starts and serves the JSON mocks:

```bash
docker run --rm -p 3000:3000 the-dawn-server:local
```

Verify:

```bash
curl http://localhost:3000/api          # Swagger UI
curl http://localhost:3000/events       # JSON payload
```

### GKE notes

- Container listens on `$PORT` (3000). Point the Service/Ingress at that port.
- Runs as non-root; no extra `securityContext` needed beyond `runAsNonRoot: true`.
- Set `ENVIRONMENT=prod` (or `pre`) so the TypeORM connection uses TLS.
- Secret: `DB_PASSWORD`, `LOGFARE_API_KEY` (both required - the pod will not
  start without the API key).
- ConfigMap: `DB_HOST`, `DB_USERNAME`, `ENVIRONMENT`, `HTTPS_PROXY`. That is all that is
  actually needed - `DB_PORT`, `DB_NAME`, `PORT` and `NODE_ENV` already carry
  correct defaults from the Dockerfile, so add them only to override.

## CORS

`src/main.ts` allows a single origin: `http://localhost:5173`. The deployed
frontend origin has to be added there before the two talk in GKE.
