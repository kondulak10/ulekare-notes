import { createPool, type Pool } from 'mariadb'
import { e2e } from './env.ts'

export type SeedNote = {
  title: string
  content?: string
  priority: 'low' | 'medium' | 'high'
  updatedAt: string
}

let pool: Pool | undefined

function db(): Pool {
  pool ??= createPool({
    host: e2e.db.host,
    port: e2e.db.port,
    user: e2e.db.user,
    password: e2e.db.password,
    database: e2e.db.database,
    timezone: 'Z',
    connectionLimit: 2,
  })
  return pool
}

function toSqlUtc(iso: string): string {
  return new Date(iso).toISOString().replace('T', ' ').replace('Z', '')
}

export async function seedNotes(notes: SeedNote[]): Promise<void> {
  await db().query('TRUNCATE TABLE notes')
  for (const note of notes) {
    const at = toSqlUtc(note.updatedAt)
    await db().query(
      'INSERT INTO notes (title, content, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [note.title, note.content ?? '', note.priority, at, at],
    )
  }
}

export async function countNotes(): Promise<number> {
  const [row]: { count: number }[] = await db().query('SELECT COUNT(*) AS count FROM notes', [])
  return Number(row?.count ?? 0)
}

export async function closeDb(): Promise<void> {
  await pool?.end()
  pool = undefined
}
