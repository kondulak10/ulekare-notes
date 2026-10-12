import type { Priority } from '@notes/shared'

export type Note = {
  id: number
  title: string
  content: string
  priority: Priority
  createdAt: Date
  updatedAt: Date
}

export type CreateNote = {
  title: string
  content: string
  priority: Priority
}

export type NoteFilter = {
  priority?: Priority
}
