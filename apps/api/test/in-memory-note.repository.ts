import type { Note, NoteFilter } from '../src/notes/note.ts'
import type { NoteRepository } from '../src/notes/note.repository.ts'

function byUpdatedDesc(a: Note, b: Note): number {
  return b.updatedAt.getTime() - a.updatedAt.getTime() || b.id - a.id
}

export class InMemoryNoteRepository implements NoteRepository {
  private readonly notes: Note[]

  constructor(notes: Note[] = []) {
    this.notes = notes
  }

  async findAll(filter: NoteFilter): Promise<Note[]> {
    return this.notes
      .filter((note) => !filter.priority || note.priority === filter.priority)
      .toSorted(byUpdatedDesc)
  }
}
