import type { Note, NoteFilter } from './note.ts'

export interface NoteRepository {
  findAll(filter: NoteFilter): Promise<Note[]>
}
