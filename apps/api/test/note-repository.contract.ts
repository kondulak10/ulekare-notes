import { describe, expect, it } from 'vitest'
import type { CreateNote, Note } from '#/notes/note.ts'
import type { NoteRepository } from '#/notes/note.repository.ts'

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

    describe('create', () => {
      const input: CreateNote = { title: 'New note', content: 'Body', priority: 'high' }

      it('returns the stored note with an id and current timestamps', async () => {
        const repo = await withNotes([])
        const before = Date.now()
        const created = await repo.create(input)

        expect(created).toMatchObject(input)
        expect(created.id).toBeGreaterThan(0)
        expect(created.createdAt).toEqual(created.updatedAt)
        expect(Math.abs(created.createdAt.getTime() - before)).toBeLessThan(60_000)
      })

      it('makes the note visible to findAll exactly as returned', async () => {
        const repo = await withNotes([])
        const created = await repo.create(input)
        expect(await repo.findAll({})).toEqual([created])
      })

      it('assigns an id no existing note has', async () => {
        const repo = await withNotes(all)
        const created = await repo.create(input)
        expect(all.map((n) => n.id)).not.toContain(created.id)
        expect(await repo.findAll({})).toHaveLength(all.length + 1)
      })

      it('lists the new note first, as the most recently updated', async () => {
        const repo = await withNotes(all)
        const created = await repo.create(input)
        expect((await repo.findAll({}))[0]?.id).toBe(created.id)
      })

      it('respects the priority filter for created notes', async () => {
        const repo = await withNotes(all)
        const created = await repo.create({ ...input, priority: 'low' })
        expect((await repo.findAll({ priority: 'low' })).map((n) => n.id)).toEqual([created.id, 1])
        expect((await repo.findAll({ priority: 'high' })).map((n) => n.id)).toEqual([2])
      })
    })

    describe('delete', () => {
      it('removes the note and reports it was deleted', async () => {
        const repo = await withNotes(all)
        expect(await repo.delete(summer.id)).toBe(true)
        expect((await repo.findAll({})).map((n) => n.id)).toEqual([4, 3, 1])
      })

      it('reports false for an unknown id and leaves other notes untouched', async () => {
        const repo = await withNotes(all)
        expect(await repo.delete(999)).toBe(false)
        expect(await repo.findAll({})).toHaveLength(all.length)
      })

      it('cannot delete the same note twice', async () => {
        const repo = await withNotes(all)
        await repo.delete(winter.id)
        expect(await repo.delete(winter.id)).toBe(false)
      })
    })
  })
}
