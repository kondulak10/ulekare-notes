import { noteSchema, type ListNotesQuery, type Note } from '@notes/shared'

// The only module that knows the API's URLs. Responses are parsed with the shared
// schema, so a contract mismatch fails loudly here instead of deep in the UI.
export async function fetchNotes(query: ListNotesQuery): Promise<Note[]> {
  const params = new URLSearchParams()
  if (query.priority) params.set('priority', query.priority)

  const res = await fetch(`/api/notes?${params}`)
  if (!res.ok) throw new Error(`Failed to load notes (${res.status})`)
  return noteSchema.array().parse(await res.json())
}
