import type { CreateNote, Note, NoteFilter } from '#/notes/note.ts'

export interface NoteRepository {
  findAll(filter: NoteFilter): Promise<Note[]>
  create(note: CreateNote): Promise<Note>
  delete(id: number): Promise<boolean>
}
