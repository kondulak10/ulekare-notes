import type { ListNotesQuery, Note } from '@notes/shared'
import type { NoteRepository } from './note.repository.ts'

export class NoteService {
  private readonly notes: NoteRepository

  constructor(notes: NoteRepository) {
    this.notes = notes
  }

  list(query: ListNotesQuery): Promise<Note[]> {
    return this.notes.findAll(query)
  }
}
