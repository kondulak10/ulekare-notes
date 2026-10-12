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

Other scripts: `npm test`, `npm run typecheck`, `npm run lint`.

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
      app.ts               createApp(deps): Express app built from injected dependencies
      config.ts            env → typed config
      http/                cross-cutting HTTP concerns (404, error → JSON)
      notes/               the notes feature, one folder per feature
        note.routes.ts         HTTP adapter: validate request, call service, respond
        note.service.ts        application logic, no HTTP or SQL inside
        note.repository.ts     NoteRepository interface
        mariadb-note.repository.ts   MariaDB implementation
    test/                  HTTP tests against an in-memory repository
  web/
    src/
      api/                 the only place that knows API URLs; parses responses with shared schemas
      notes/               feature components + hooks (list, card, filter, query keys)
      lib/                 small generic hooks
packages/
  shared/                  zod schemas + inferred types: the API contract
```

## Key design decisions

**Layered API: routes → service → repository.** Each layer has one reason to change (Single Responsibility). Routes deal with HTTP, the service with application rules, the repository with SQL. The service depends on the `NoteRepository` interface, not on MariaDB (Dependency Inversion), so tests run against `InMemoryNoteRepository` with no database, and swapping storage touches one class.

**Composition root.** Everything is constructed in `index.ts` and passed in through constructors. No framework DI container: at this size, plain constructor injection is easier to read.

**One contract, two consumers.** `packages/shared` defines the note schema, the create/update inputs and the list query once, with zod. The API validates requests with them. The web app reuses the types and parses API responses, so a contract mismatch fails at the boundary instead of somewhere in the UI. Partial updates use a schema without defaults, so omitted fields are never reset.

**MariaDB over MongoDB.** The data is tabular, and the obvious next features (tags, sharing with users) are relations: join tables and foreign keys. MariaDB also has a defined LTS line (12.3), which the brief asks for. `priority` is an `ENUM`, so the database rejects unknown values and sorts by declaration order (low < medium < high). An index on `(priority, updated_at)` covers the filtered, newest-first list.

**Timestamps in UTC end to end.** The connection sets the session time zone to UTC, and dates are read as strings and parsed explicitly as UTC. The driver would otherwise interpret them in the API host's local time zone.

**No build step for the API.** Node 24 strips TypeScript types natively, so `node src/index.ts` runs the source as is. The code sticks to erasable syntax (no enums or parameter properties), which `tsc` enforces.

**Frontend.**
- Server state lives in TanStack Query, with caching, loading/error states and refetching handled in one place, and query keys in one factory.
- The priority filter lives in the URL (`?priority=high`), so a filtered view survives a reload and can be shared. An invalid value falls back to "all" instead of breaking the page.
- Every list state is designed: loading, error with retry, empty for the current filter.
- The UI is in Czech, the code in English.

## Status and next steps

Done: project setup, Docker, schema + seed, shared contract, and the list with priority filter running end to end (DB → API → UI), with tests.

Next:
- [ ] `POST /api/notes` + create form (validation messages from the shared schema)
- [ ] `PATCH /api/notes/:id` + edit (inline or in a dialog), 404 for unknown ids
- [ ] Optimistic updates, so the list feels instant
- [ ] Sort options (newest / priority), search in title and content

## How it would grow

**Users and sharing.** Add a `users` table and `owner_id` on notes, then `note_shares (note_id, user_id, role)`. Every repository method takes the acting user and scopes its queries. Permission checks (owner can edit, viewer can only read) go into the service layer, not the routes. The current `NoteService` is where that seam is.

**Tags.** `tags` + `note_tags` join table, a `TagRepository`, and tag filters added to `ListNotesQuery`, so the contract grows in one place.

**Larger codebase.** Keep one folder per feature (`notes/`, `tags/`, `users/`), each with its own routes/service/repository. Add DB migrations with a migration tool instead of init scripts, and integration tests against a real MariaDB in Docker.

## Use of AI

The scaffold, the Docker setup and the first vertical slice were generated with Claude Code, pairing on the design decisions above. Every generated piece was reviewed, run and tested. One example: the MariaDB driver parsed DATETIME in the host's local time zone, which showed up as a 2-hour shift between the Mac and the container. It was caught while testing and fixed with explicit UTC parsing.
