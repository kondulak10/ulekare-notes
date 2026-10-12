import { noteSchema, type ListNotesQuery, type Note } from '@notes/shared'

export async function fetchNotes(query: ListNotesQuery): Promise<Note[]> {
  const params = new URLSearchParams()
  if (query.priority) params.set('priority', query.priority)

  const res = await fetch(`/api/notes?${params}`)
  if (!res.ok) throw new Error(`Failed to load notes (${res.status})`)
  return noteSchema.array().parse(await res.json())
}
