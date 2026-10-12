import { expect, test } from '@playwright/test'
import { closeDb, countNotes, seedNotes } from '../db.ts'
import {
  isNotesApi,
  noteCard,
  noteDialog,
  noteTitles,
  priorityFilter,
  sampleNotes,
} from '../helpers.ts'

test.afterAll(closeDb)

test.describe('creating a note', () => {
  test.beforeEach(async ({ page }) => {
    await seedNotes(sampleNotes)
    await page.goto('/')
    await page.getByRole('button', { name: 'Přidat poznámku' }).click()
  })

  test('saves the note and shows it at the top of the list', async ({ page }) => {
    const dialog = noteDialog(page)
    await dialog.getByLabel('Název').fill('Koupit vitamín D')
    await dialog.getByLabel('Obsah').fill('Lékárna, 2 balení')
    await dialog.getByText('Vysoká', { exact: true }).click()
    await expect(dialog.getByText('16/200')).toBeVisible()
    await dialog.getByRole('button', { name: 'Uložit' }).click()

    await expect(dialog).toBeHidden()
    await expect(noteTitles(page).first()).toHaveText('Koupit vitamín D')
    const card = noteCard(page, 'Koupit vitamín D')
    await expect(card).toContainText('Lékárna, 2 balení')
    await expect(card).toContainText('Vysoká')

    await page.reload()
    await expect(noteTitles(page).first()).toHaveText('Koupit vitamín D')
  })

  test('opens with the title focused and medium priority preselected', async ({ page }) => {
    const dialog = noteDialog(page)
    await expect(dialog.getByLabel('Název')).toBeFocused()
    await expect(dialog.getByRole('radio', { name: 'Střední' })).toBeChecked()
  })

  test('does not submit without a title', async ({ page }) => {
    const posts: string[] = []
    page.on('request', (request) => {
      if (request.method() === 'POST') posts.push(request.url())
    })

    await noteDialog(page).getByRole('button', { name: 'Uložit' }).click()

    await expect(noteDialog(page)).toBeVisible()
    expect(posts).toEqual([])
    expect(await countNotes()).toBe(sampleNotes.length)
  })

  test('closes without saving via Zrušit, Escape and the backdrop', async ({ page }) => {
    const dialog = noteDialog(page)
    await dialog.getByLabel('Název').fill('Neuložit')
    await dialog.getByRole('button', { name: 'Zrušit' }).click()
    await expect(dialog).toBeHidden()

    await page.getByRole('button', { name: 'Přidat poznámku' }).click()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await page.getByRole('button', { name: 'Přidat poznámku' }).click()
    await page.mouse.click(5, 5)
    await expect(dialog).toBeHidden()

    await expect(noteTitles(page)).toHaveCount(sampleNotes.length)
    expect(await countNotes()).toBe(sampleNotes.length)
  })

  test('keeps the typed input and shows an error when saving fails', async ({ page }) => {
    await page.route(isNotesApi, (route) =>
      route.request().method() === 'POST' ? route.fulfill({ status: 500 }) : route.fallback(),
    )
    const dialog = noteDialog(page)
    await dialog.getByLabel('Název').fill('Důležitá věc')
    await dialog.getByRole('button', { name: 'Uložit' }).click()

    await expect(dialog.getByRole('alert')).toHaveText('Při vytváření poznámky došlo k chybě')
    await expect(dialog.getByLabel('Název')).toHaveValue('Důležitá věc')
    await expect(dialog.getByRole('button', { name: 'Uložit' })).toBeEnabled()
  })

  test('a note outside the active filter appears once the filter allows it', async ({ page }) => {
    await page.keyboard.press('Escape')
    await priorityFilter(page).getByRole('radio', { name: 'Nízká' }).click()
    await page.getByRole('button', { name: 'Přidat poznámku' }).click()

    const dialog = noteDialog(page)
    await dialog.getByLabel('Název').fill('Urgentní')
    await dialog.getByText('Vysoká', { exact: true }).click()
    await dialog.getByRole('button', { name: 'Uložit' }).click()

    await expect(dialog).toBeHidden()
    await expect(noteTitles(page)).toHaveText(['Přečíst článek o spánku'])
    await priorityFilter(page).getByRole('radio', { name: 'Vysoká' }).click()
    await expect(noteTitles(page).first()).toHaveText('Urgentní')
  })
})
