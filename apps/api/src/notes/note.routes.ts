import { Router } from 'express'
import { createNoteSchema, listNotesQuerySchema } from '@notes/shared'
import { toNoteDto } from '#/notes/note.dto.ts'
import type { NoteService } from '#/notes/note.service.ts'

export function createNoteRouter(service: NoteService): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const query = listNotesQuerySchema.parse(req.query)
    const notes = await service.list({ priority: query.priority })
    res.json(notes.map(toNoteDto))
  })

  router.post('/', async (req, res) => {
    const input = createNoteSchema.parse(req.body)
    const note = await service.create(input)
    res.status(201).json(toNoteDto(note))
  })

  return router
}
