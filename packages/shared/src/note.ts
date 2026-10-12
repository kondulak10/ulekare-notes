import { z } from 'zod'

// Single source of truth for the note contract: the API validates requests
// with these schemas and the web app reuses them for its forms and types.

export const PRIORITIES = ['low', 'medium', 'high'] as const
export const prioritySchema = z.enum(PRIORITIES)
export type Priority = z.infer<typeof prioritySchema>

export const TITLE_MAX = 200
export const CONTENT_MAX = 10_000

export const noteSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  content: z.string(),
  priority: prioritySchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export type Note = z.infer<typeof noteSchema>

const noteFields = {
  title: z.string().trim().min(1, 'Title is required').max(TITLE_MAX),
  content: z.string().max(CONTENT_MAX),
  priority: prioritySchema,
}

export const createNoteSchema = z.object({
  title: noteFields.title,
  content: noteFields.content.default(''),
  priority: noteFields.priority.default('medium'),
})
export type CreateNoteInput = z.infer<typeof createNoteSchema>

// No defaults here: a partial update must not reset fields the client omitted.
export const updateNoteSchema = z.object(noteFields).partial()
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>

export const listNotesQuerySchema = z.object({
  priority: prioritySchema.optional(),
})
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>
