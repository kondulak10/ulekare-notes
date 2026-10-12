# Notes

A small notes app: create a note (title, content, priority), delete it, and browse all notes filtered by priority. Editing comes in phase 2.

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

Other scripts: `npm test` (unit, no database needed), `npm run test:integration` and `npm run test:e2e` (both need `npm run db:up`), `npm run typecheck`, `npm run lint`, `npm run format`.

To reset the database (re-runs the migrations and seed): `docker compose down -v`.

## Stack

| Layer    | Choice                                   | Version                |
| -------- | ---------------------------------------- | ---------------------- |
| Runtime  | Node.js, runs TypeScript natively        | 24 LTS                 |
| API      | Express                                  | 5                      |
| Database | MariaDB, official `mariadb` connector    | 12.3 LTS               |
| Web      | React + Vite, TanStack Query, Tailwind   | React 19, Vite 8       |
| Shared   | zod schemas used by both API and web     | zod 4                  |
| Tests    | Vitest + Supertest, Playwright           | Playwright 1.63        |

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
      errors.ts            domain errors (NotFoundError), mapped to HTTP status codes by the error handler
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
      in-memory-note.repository.ts  in-memory NoteRepository used by the unit tests
      *.test.ts                     unit: HTTP tests + contract against the in-memory repository
      *.integration.test.ts         contract against real MariaDB, inside a rolled-back transaction
  web/
    src/
      api/                 the only place that knows API URLs; parses responses with shared schemas
      notes/               the notes feature: query hooks (useNotes.ts), priority labels and colours
        add/                   create form (dialog)
        view/                  list, card (with delete), priority filter
      ui/                  shared button styles
      lib/                 small generic hooks (filter state in the URL)
packages/
  shared/                  zod schemas + inferred types: the API contract
e2e/
  playwright.config.ts     starts its own API (:3100) and web (:5180) against the notes_e2e database
  global-setup.ts          recreates notes_e2e from the API's schema migration before each run
  tests/                   list, create and delete in a real browser
```

# Scope decisions
Limited application with missing critical parts:
- No CI/CD (e.g. pull requests, tests)
- No deployment (e.g. Vercel)
- No design system (existing desing system or Storybook)
- No authentification, authorization or roles (e.g. JWT tokens)
- No creativity (execution within the required scope with a few product decisions)

# Design decisions 
## Monorepo
Simple application, no need for complexity:
- Frontend and backend together
- Sharing types via /shared contracts zod

## Languages, frameworks and config
Quite standard stack: React, Typescript, SQL (MariaDB), Node, Playwright, ESLint and Prettier, Docker
- According to the assignment + personal preference (React)
- Absolute imports for easier paths
- ESLint and Prettier for code formatting
- Docker (db only possible for quick development)
- No extra frameworks due to scope and requirements (e.g. NestJs)
- Maria over Mongo due to the shape of the data (relational data)
- TanStack query and Rest for simple communication and caching
- E2E tests on separate DB, integration tests with rollback
- Playwright tests of UI (npm run test:e2e)

## Patterns
Simple patterns to demonstrate modularity and SOLID principles
- routes (http requests) -> servic (application logic) -> repository (SQL)
- 2 note repositories: MariaDB and InMemory for testing, and demonstration of swapping
- note.dto.ts extra layer for splitting database layer structure and API response
- zod validations for input (e.g. delete id)

# Next steps
## Assignment
- Add the update feature

## In app if continued
- Auth -> Deploy -> CI/CD -> Design system -> New features

