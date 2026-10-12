import express from 'express'
import { errorHandler, notFound } from '#/http/error-handler.ts'
import { createNoteRouter } from '#/notes/note.routes.ts'
import type { NoteService } from '#/notes/note.service.ts'

export type AppDeps = {
  noteService: NoteService
}

export function createApp({ noteService }: AppDeps) {
  const app = express()
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })
  app.use('/api/notes', createNoteRouter(noteService))

  app.use(notFound)
  app.use(errorHandler)
  return app
}
