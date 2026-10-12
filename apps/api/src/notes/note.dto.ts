import type { Note as NoteDto } from '@notes/shared'
import type { Note } from './note.ts'

export function toNoteDto(note: Note): NoteDto {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    priority: note.priority,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }
}
