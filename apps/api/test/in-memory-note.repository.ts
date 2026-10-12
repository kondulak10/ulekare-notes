import type { ListNotesQuery, Note } from '@notes/shared'
import type { NoteRepository } from '../src/notes/note.repository.ts'

export class InMemoryNoteRepository implements NoteRepository {
  private readonly notes: Note[]

  constructor(notes: Note[] = []) {
    this.notes = notes
  }

  async findAll(filter: ListNotesQuery): Promise<Note[]> {
    return this.notes
      .filter((note) => !filter.priority || note.priority === filter.priority)
      .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
}
