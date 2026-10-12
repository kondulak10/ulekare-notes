import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { TITLE_MAX, type Note as NoteDto } from '@notes/shared'
import { createApp } from '#/app.ts'
import type { Note } from '#/notes/note.ts'
import { NoteService } from '#/notes/note.service.ts'
import { InMemoryNoteRepository } from '#test/in-memory-note.repository.ts'

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

describe('POST /api/notes', () => {
  it('creates a note and responds 201 with it', async () => {
    const res = await request(appWith([]))
      .post('/api/notes')
      .send({ title: 'Buy milk', content: 'Two litres', priority: 'high' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      id: 1,
      title: 'Buy milk',
      content: 'Two litres',
      priority: 'high',
    })
    expect(new Date(res.body.createdAt).toISOString()).toBe(res.body.createdAt)
  })

  it('makes the created note appear in the list', async () => {
    const app = appWith([note(1, 'low', '2026-10-01T10:00:00.000Z')])
    const created = await request(app).post('/api/notes').send({ title: 'Fresh' })

    const list = await request(app).get('/api/notes')
    expect(list.body.map((n: NoteDto) => n.id)).toEqual([created.body.id, 1])
  })

  it('applies defaults and trims the title', async () => {
    const res = await request(appWith([])).post('/api/notes').send({ title: '  Only a title  ' })
    expect(res.body).toMatchObject({ title: 'Only a title', content: '', priority: 'medium' })
  })

  it.each([
    ['a missing title', {}],
    ['a blank title', { title: '   ' }],
    ['a title over the limit', { title: 'x'.repeat(TITLE_MAX + 1) }],
  ])('rejects %s', async (_case, body) => {
    const res = await request(appWith([])).post('/api/notes').send(body)
    expect(res.status).toBe(400)
    expect(res.body.fields.title).toBeDefined()
  })

  it('rejects an unknown priority', async () => {
    const res = await request(appWith([]))
      .post('/api/notes')
      .send({ title: 'x', priority: 'urgent' })
    expect(res.status).toBe(400)
    expect(res.body.fields.priority).toBeDefined()
  })

  it('rejects a body sent without a JSON content type', async () => {
    const res = await request(appWith([]))
      .post('/api/notes')
      .set('Content-Type', 'text/plain')
      .send(JSON.stringify({ title: 'x' }))
    expect(res.status).toBe(400)
  })

  it('rejects malformed JSON with 400 instead of a server error', async () => {
    const res = await request(appWith([]))
      .post('/api/notes')
      .set('Content-Type', 'application/json')
      .send('{"title": broken')
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Malformed JSON body' })
  })

  it('does not store anything when validation fails', async () => {
    const app = appWith([])
    await request(app).post('/api/notes').send({ title: '' })
    const list = await request(app).get('/api/notes')
    expect(list.body).toEqual([])
  })
})

describe('DELETE /api/notes/:id', () => {
  const notes = [
    note(1, 'low', '2026-10-01T10:00:00.000Z'),
    note(2, 'high', '2026-10-02T10:00:00.000Z'),
  ]

  it('deletes the note and responds 204 with no body', async () => {
    const app = appWith(notes)
    const res = await request(app).delete('/api/notes/2')

    expect(res.status).toBe(204)
    expect(res.text).toBe('')
    const list = await request(app).get('/api/notes')
    expect(list.body.map((n: NoteDto) => n.id)).toEqual([1])
  })

  it('responds 404 for a note that does not exist', async () => {
    const res = await request(appWith(notes)).delete('/api/notes/999')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Note 999 not found' })
  })

  it('responds 404 when deleting the same note twice', async () => {
    const app = appWith(notes)
    await request(app).delete('/api/notes/1')
    expect((await request(app).delete('/api/notes/1')).status).toBe(404)
  })

  it.each(['abc', '0', '-1', '1.5'])('rejects the invalid id %s with 400', async (id) => {
    const res = await request(appWith(notes)).delete(`/api/notes/${id}`)
    expect(res.status).toBe(400)
    expect(res.body.fields.id).toBeDefined()
  })
})
