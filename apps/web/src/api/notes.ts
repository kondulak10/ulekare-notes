import { noteSchema, type CreateNoteInput, type ListNotesQuery, type Note } from '@notes/shared'

export async function fetchNotes(query: ListNotesQuery): Promise<Note[]> {
  const params = new URLSearchParams()
  if (query.priority) params.set('priority', query.priority)

  const res = await fetch(`/api/notes?${params}`)
  if (!res.ok) throw new Error(`Failed to load notes (${res.status})`)
  return noteSchema.array().parse(await res.json())
}

export async function createNote(note: CreateNoteInput): Promise<Note> {
  const res = await fetch('/api/notes', {
    method: 'POST',
    body: JSON.stringify(note),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Failed to create note (${res.status})`)
  return noteSchema.parse(await res.json())
}
