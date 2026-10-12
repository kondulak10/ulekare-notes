import { createPool } from 'mariadb'
import { createApp } from './app.ts'
import { loadConfig } from './config.ts'
import { MariaDbNoteRepository } from './notes/mariadb-note.repository.ts'
import { NoteService } from './notes/note.service.ts'

// Composition root: the only place that knows which implementations are wired together.
const config = loadConfig()
// Store and read timestamps in UTC no matter where the API or the DB runs
const pool = createPool({ ...config.db, connectionLimit: 5, timezone: 'Z', dateStrings: true })

const noteService = new NoteService(new MariaDbNoteRepository(pool))
const app = createApp({ noteService })

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`)
})

function shutdown() {
  server.close(() => {
    void pool.end().then(() => process.exit(0))
  })
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
