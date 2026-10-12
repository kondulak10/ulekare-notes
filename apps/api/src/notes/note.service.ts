import type { CreateNote, Note, NoteFilter } from '#/notes/note.ts'
import type { NoteRepository } from '#/notes/note.repository.ts'

export class NoteService {
  private readonly notes: NoteRepository

  constructor(notes: NoteRepository) {
    this.notes = notes
  }

  list(filter: NoteFilter): Promise<Note[]> {
    return this.notes.findAll(filter)
  }

  create(note: CreateNote): Promise<Note> {
    return this.notes.create(note)
  }
}
