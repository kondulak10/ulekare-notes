import type { PoolConnection } from 'mariadb'
import { afterAll, afterEach } from 'vitest'
import { loadConfig } from '#/config.ts'
import { createDbPool } from '#/db.ts'
import type { Note } from '#/notes/note.ts'
import { MariaDbNoteRepository } from '#/notes/mariadb-note.repository.ts'
import { noteRepositoryContract } from '#test/note-repository.contract.ts'

const pool = createDbPool(loadConfig().db)
let connection: PoolConnection | undefined

function toSqlUtc(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '')
}

afterEach(async () => {
  await connection?.rollback()
  await connection?.release()
  connection = undefined
})

afterAll(() => pool.end())

noteRepositoryContract('MariaDbNoteRepository', async (notes: Note[]) => {
  connection = await pool.getConnection()
  await connection.beginTransaction()
  await connection.query('DELETE FROM notes')
  for (const note of notes) {
    await connection.query(
      'INSERT INTO notes (id, title, content, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        note.id,
        note.title,
        note.content,
        note.priority,
        toSqlUtc(note.createdAt),
        toSqlUtc(note.updatedAt),
      ],
    )
  }
  return new MariaDbNoteRepository(connection)
})
