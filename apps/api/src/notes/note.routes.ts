import { Router } from 'express'
import { listNotesQuerySchema } from '@notes/shared'
import type { NoteService } from './note.service.ts'

export function createNoteRouter(service: NoteService): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const query = listNotesQuerySchema.parse(req.query)
    res.json(await service.list(query))
  })

  return router
}
