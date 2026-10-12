import { createApp } from './app.ts'
import { loadConfig } from './config.ts'
import { createDbPool } from './db.ts'
import { MariaDbNoteRepository } from './notes/mariadb-note.repository.ts'
import { NoteService } from './notes/note.service.ts'

const config = loadConfig()
const pool = createDbPool(config.db)

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
