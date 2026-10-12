import { describe, expect, it } from 'vitest'
import type { Note } from '../src/notes/note.ts'
import type { NoteRepository } from '../src/notes/note.repository.ts'

export type RepositoryFactory = (notes: Note[]) => Promise<NoteRepository>

function note(id: number, priority: Note['priority'], updatedAt: string): Note {
  return {
    id,
    title: `Note ${id}`,
    content: `Content ${id}`,
    priority,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date(updatedAt),
  }
}

export function noteRepositoryContract(name: string, withNotes: RepositoryFactory) {
  describe(`${name} (NoteRepository contract)`, () => {
    const winter = note(1, 'low', '2026-01-15T08:00:00.000Z')
    const summer = note(2, 'high', '2026-07-15T08:00:00.123Z')
    const sameTimeA = note(3, 'medium', '2026-03-01T12:00:00.000Z')
    const sameTimeB = note(4, 'medium', '2026-03-01T12:00:00.000Z')
    const all = [winter, summer, sameTimeA, sameTimeB]

    it('returns all notes, most recently updated first, ties broken by newest id', async () => {
      const repo = await withNotes(all)
      const ids = (await repo.findAll({})).map((n) => n.id)
      expect(ids).toEqual([2, 4, 3, 1])
    })

    it('filters by priority', async () => {
      const repo = await withNotes(all)
      const ids = (await repo.findAll({ priority: 'medium' })).map((n) => n.id)
      expect(ids).toEqual([4, 3])
    })

    it('returns an empty list when nothing matches', async () => {
      const repo = await withNotes([winter])
      expect(await repo.findAll({ priority: 'high' })).toEqual([])
    })

    it('returns notes with every field intact, timestamps as exact UTC instants', async () => {
      const repo = await withNotes([winter, summer])
      expect(await repo.findAll({})).toEqual([summer, winter])
    })
  })
}
