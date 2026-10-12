import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError, z } from 'zod'
import { NotFoundError } from '#/errors.ts'

function isMalformedJson(err: unknown): boolean {
  return err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed'
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' })
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', fields: z.flattenError(err).fieldErrors })
    return
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message })
    return
  }
  if (isMalformedJson(err)) {
    res.status(400).json({ error: 'Malformed JSON body' })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
