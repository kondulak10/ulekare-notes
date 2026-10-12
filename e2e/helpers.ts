import type { Page } from '@playwright/test'
import type { SeedNote } from './db.ts'

export const sampleNotes: SeedNote[] = [
  { title: 'Přečíst článek o spánku', priority: 'low', updatedAt: '2026-10-01T08:00:00Z' },
  {
    title: 'Objednat se na prohlídku',
    content: 'Praktický lékař, ráno.',
    priority: 'high',
    updatedAt: '2026-10-03T08:00:00Z',
  },
  { title: 'Vyzvednout recept', priority: 'medium', updatedAt: '2026-10-02T08:00:00Z' },
]

export function isNotesApi(url: URL): boolean {
  return url.pathname === '/api/notes'
}

export function noteTitles(page: Page) {
  return page.getByRole('article').getByRole('heading')
}

export function noteCard(page: Page, title: string) {
  return page.getByRole('article').filter({ has: page.getByRole('heading', { name: title }) })
}

export function priorityFilter(page: Page) {
  return page.getByRole('radiogroup', { name: 'Filtr podle priority' })
}

export function noteDialog(page: Page) {
  return page.getByRole('dialog', { name: 'Nová poznámka' })
}
