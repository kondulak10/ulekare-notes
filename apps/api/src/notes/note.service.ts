import type { Note, NoteFilter } from './note.ts'
import type { NoteRepository } from './note.repository.ts'

export class NoteService {
  private readonly notes: NoteRepository

  constructor(notes: NoteRepository) {
    this.notes = notes
  }

  list(filter: NoteFilter): Promise<Note[]> {
    return this.notes.findAll(filter)
  }
}
