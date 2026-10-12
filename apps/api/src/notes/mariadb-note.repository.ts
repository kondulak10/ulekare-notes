import type { Pool } from 'mariadb'
import type { ListNotesQuery, Note, Priority } from '@notes/shared'
import type { NoteRepository } from './note.repository.ts'

type NoteRow = {
  id: number
  title: string
  content: string
  priority: Priority
  created_at: string
  updated_at: string
}

const COLUMNS = 'id, title, content, priority, created_at, updated_at'

function utcToIso(value: string): string {
  return new Date(`${value.replace(' ', 'T')}Z`).toISOString()
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    priority: row.priority,
    createdAt: utcToIso(row.created_at),
    updatedAt: utcToIso(row.updated_at),
  }
}

export class MariaDbNoteRepository implements NoteRepository {
  private readonly pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
  }

  async findAll(filter: ListNotesQuery): Promise<Note[]> {
    const where = filter.priority ? 'WHERE priority = ?' : ''
    const params = filter.priority ? [filter.priority] : []
    const rows: NoteRow[] = await this.pool.query(
      `SELECT ${COLUMNS} FROM notes ${where} ORDER BY updated_at DESC, id DESC`,
      params,
    )
    return rows.map(toNote)
  }
}
