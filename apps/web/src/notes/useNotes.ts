import { useQuery } from '@tanstack/react-query'
import type { ListNotesQuery } from '@notes/shared'
import { fetchNotes } from '../api/notes.ts'

export const notesKeys = {
  all: ['notes'] as const,
  list: (query: ListNotesQuery) => [...notesKeys.all, 'list', query] as const,
}

export function useNotes(query: ListNotesQuery) {
  return useQuery({
    queryKey: notesKeys.list(query),
    queryFn: () => fetchNotes(query),
  })
}
