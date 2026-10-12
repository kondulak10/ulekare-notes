import type { ListNotesQuery, Note } from '@notes/shared'

// The service depends on this abstraction, not on MariaDB (Dependency Inversion).
// Tests swap in an in-memory implementation.
export interface NoteRepository {
  findAll(filter: ListNotesQuery): Promise<Note[]>
}
