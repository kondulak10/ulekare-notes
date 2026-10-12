import { Router } from 'express'
import { listNotesQuerySchema } from '@notes/shared'
import { toNoteDto } from './note.dto.ts'
import type { NoteService } from './note.service.ts'

export function createNoteRouter(service: NoteService): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const query = listNotesQuerySchema.parse(req.query)
    const notes = await service.list({ priority: query.priority })
    res.json(notes.map(toNoteDto))
  })

  return router
}
