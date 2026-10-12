import type { Pool } from 'mariadb'
import type { Priority } from '@notes/shared'
import type { Note, NoteFilter } from './note.ts'
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

function utcToDate(value: string): Date {
  return new Date(`${value.replace(' ', 'T')}Z`)
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    priority: row.priority,
    createdAt: utcToDate(row.created_at),
    updatedAt: utcToDate(row.updated_at),
  }
}

export class MariaDbNoteRepository implements NoteRepository {
  private readonly db: Pick<Pool, 'query'>

  constructor(db: Pick<Pool, 'query'>) {
    this.db = db
  }

  async findAll(filter: NoteFilter): Promise<Note[]> {
    const where = filter.priority ? 'WHERE priority = ?' : ''
    const params = filter.priority ? [filter.priority] : []
    const rows: NoteRow[] = await this.db.query(
      `SELECT ${COLUMNS} FROM notes ${where} ORDER BY updated_at DESC, id DESC`,
      params,
    )
    return rows.map(toNote)
  }
}
