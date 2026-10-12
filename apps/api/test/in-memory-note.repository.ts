import type { CreateNote, Note, NoteFilter } from '#/notes/note.ts'
import type { NoteRepository } from '#/notes/note.repository.ts'

function byUpdatedDesc(a: Note, b: Note): number {
  return b.updatedAt.getTime() - a.updatedAt.getTime() || b.id - a.id
}

export class InMemoryNoteRepository implements NoteRepository {
  private readonly notes: Note[]

  constructor(notes: Note[] = []) {
    this.notes = [...notes]
  }

  async findAll(filter: NoteFilter): Promise<Note[]> {
    return this.notes
      .filter((note) => !filter.priority || note.priority === filter.priority)
      .toSorted(byUpdatedDesc)
  }

  async create(note: CreateNote): Promise<Note> {
    const newNote = {
      ...note,
      id: Math.max(0, ...this.notes.map((note) => note.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.notes.push(newNote)
    return newNote
  }
}
