import request from 'supertest'
import { describe, expect, it } from 'vitest'
import type { Note as NoteDto } from '@notes/shared'
import { createApp } from '../src/app.ts'
import type { Note } from '../src/notes/note.ts'
import { NoteService } from '../src/notes/note.service.ts'
import { InMemoryNoteRepository } from './in-memory-note.repository.ts'

function note(id: number, priority: Note['priority'], updatedAt: string): Note {
  const date = new Date(updatedAt)
  return { id, title: `Note ${id}`, content: '', priority, createdAt: date, updatedAt: date }
}

function appWith(notes: Note[]) {
  return createApp({ noteService: new NoteService(new InMemoryNoteRepository(notes)) })
}

describe('GET /api/notes', () => {
  const notes = [
    note(1, 'low', '2026-10-01T10:00:00.000Z'),
    note(2, 'high', '2026-10-03T10:00:00.000Z'),
    note(3, 'high', '2026-10-02T10:00:00.000Z'),
  ]

  it('lists all notes, most recently updated first', async () => {
    const res = await request(appWith(notes)).get('/api/notes')
    expect(res.status).toBe(200)
    expect(res.body.map((n: NoteDto) => n.id)).toEqual([2, 3, 1])
  })

  it('serializes dates as ISO strings', async () => {
    const res = await request(appWith(notes)).get('/api/notes')
    expect(res.body[0]).toMatchObject({ id: 2, updatedAt: '2026-10-03T10:00:00.000Z' })
  })

  it('filters by priority', async () => {
    const res = await request(appWith(notes)).get('/api/notes?priority=high')
    expect(res.body.map((n: NoteDto) => n.id)).toEqual([2, 3])
  })

  it('rejects an unknown priority', async () => {
    const res = await request(appWith(notes)).get('/api/notes?priority=urgent')
    expect(res.status).toBe(400)
    expect(res.body.fields.priority).toBeDefined()
  })
})
