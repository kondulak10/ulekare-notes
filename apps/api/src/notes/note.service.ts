import type { ListNotesQuery, Note } from '@notes/shared'
import type { NoteRepository } from './note.repository.ts'

// Application logic lives here; it knows nothing about HTTP or SQL.
// Permission checks (owner, shared-with) will go here once notes get users.
export class NoteService {
  private readonly notes: NoteRepository

  constructor(notes: NoteRepository) {
    this.notes = notes
  }

  list(query: ListNotesQuery): Promise<Note[]> {
    return this.notes.findAll(query)
  }
}
