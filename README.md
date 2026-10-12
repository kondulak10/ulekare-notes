# Notes

A small notes app: create a note (title, content, priority), edit it, and browse all notes filtered by priority.

Built as a fullstack assignment for uLékaře.cz — React + Node.js + MariaDB, all TypeScript, runnable with one Docker command.

## Run it

Requirements: Docker (with Compose).

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:8080. The database starts with three sample notes.

### Local development

Requirements: Node.js 24 LTS (`.nvmrc`), Docker for the database.

```bash
cp .env.example .env
npm install
npm run db:up      # MariaDB 12.3 in Docker, on port 3307
npm run dev        # API on :3000 (watch mode), web on :5173 with /api proxied to the API
```

Other scripts: `npm test` (unit, no database needed), `npm run test:integration` (needs `npm run db:up`), `npm run typecheck`, `npm run lint`.

To reset the database (re-runs the migrations and seed): `docker compose down -v`.

## Stack

| Layer    | Choice                                   | Version                |
| -------- | ---------------------------------------- | ---------------------- |
| Runtime  | Node.js, runs TypeScript natively        | 24 LTS                 |
| API      | Express                                  | 5                      |
| Database | MariaDB, official `mariadb` connector    | 12.3 LTS               |
| Web      | React + Vite, TanStack Query, Tailwind   | React 19, Vite 8       |
| Shared   | zod schemas used by both API and web     | zod 4                  |
| Tests    | Vitest + Supertest                       |                        |

## Project structure

```
apps/
  api/
    db/migrations/         SQL run on first DB start (schema + seed)
    src/
      index.ts             composition root: wires pool → repository → service → app
      db.ts                MariaDB pool with the UTC settings, shared by the app and the integration tests
      app.ts               createApp(deps): Express app built from injected dependencies
      config.ts            env → typed config
      http/                cross-cutting HTTP concerns (404, error → JSON)
      notes/               the notes feature, one folder per feature
        note.ts                domain types: Note (with Date fields), NoteFilter
        note.dto.ts            domain Note → API response shape
        note.routes.ts         HTTP adapter: validate request, call service, respond
        note.service.ts        application logic, no HTTP or SQL inside
        note.repository.ts     NoteRepository interface
        mariadb-note.repository.ts   MariaDB implementation
    test/
      note-repository.contract.ts   one test suite every NoteRepository must pass
      *.test.ts                     unit: HTTP tests + contract against the in-memory repository
      *.integration.test.ts         contract against real MariaDB, inside a rolled-back transaction
  web/
    src/
      api/                 the only place that knows API URLs; parses responses with shared schemas
      notes/               feature components + hooks (list, card, filter, query keys)
      lib/                 small generic hooks
packages/
  shared/                  zod schemas + inferred types: the API contract
```
