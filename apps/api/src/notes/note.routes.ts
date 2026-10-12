import { Router } from 'express'
import { listNotesQuerySchema } from '@notes/shared'
import type { NoteService } from './note.service.ts'

// HTTP adapter only: parse and validate the request, call the service, shape the response.
export function createNoteRouter(service: NoteService): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const query = listNotesQuerySchema.parse(req.query)
    res.json(await service.list(query))
  })

  return router
}
