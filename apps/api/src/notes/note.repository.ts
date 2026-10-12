import type { ListNotesQuery, Note } from '@notes/shared'

export interface NoteRepository {
  findAll(filter: ListNotesQuery): Promise<Note[]>
}
