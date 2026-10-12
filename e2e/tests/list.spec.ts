import { expect, test } from '@playwright/test'
import { closeDb, seedNotes } from '../db.ts'
import { isNotesApi, noteTitles, priorityFilter, sampleNotes } from '../helpers.ts'

test.afterAll(closeDb)

test.describe('note list', () => {
  test('shows all notes, most recently updated first', async ({ page }) => {
    await seedNotes(sampleNotes)
    await page.goto('/')

    await expect(noteTitles(page)).toHaveText([
      'Objednat se na prohlídku',
      'Vyzvednout recept',
      'Přečíst článek o spánku',
    ])
    await expect(page.getByRole('article').first()).toContainText('Praktický lékař, ráno.')
  })

  test('shows an empty state when there are no notes', async ({ page }) => {
    await seedNotes([])
    await page.goto('/')

    await expect(page.getByText('Zatím tu nejsou žádné poznámky.')).toBeVisible()
  })

  test('filters by priority and keeps the filter in the URL across a reload', async ({ page }) => {
    await seedNotes(sampleNotes)
    await page.goto('/')

    await priorityFilter(page).getByRole('radio', { name: 'Vysoká' }).click()
    await expect(page).toHaveURL(/\?priority=high$/)
    await expect(noteTitles(page)).toHaveText(['Objednat se na prohlídku'])

    await page.reload()
    await expect(priorityFilter(page).getByRole('radio', { name: 'Vysoká' })).toBeChecked()
    await expect(noteTitles(page)).toHaveText(['Objednat se na prohlídku'])

    await priorityFilter(page).getByRole('radio', { name: 'Vše' }).click()
    await expect(page).not.toHaveURL(/priority=/)
    await expect(noteTitles(page)).toHaveCount(3)
  })

  test('restores the previous filter with the browser back button', async ({ page }) => {
    await seedNotes(sampleNotes)
    await page.goto('/')

    await priorityFilter(page).getByRole('radio', { name: 'Nízká' }).click()
    await priorityFilter(page).getByRole('radio', { name: 'Střední' }).click()
    await page.goBack()

    await expect(priorityFilter(page).getByRole('radio', { name: 'Nízká' })).toBeChecked()
    await expect(noteTitles(page)).toHaveText(['Přečíst článek o spánku'])
  })

  test('explains when the selected priority has no notes', async ({ page }) => {
    await seedNotes([sampleNotes[0]!])
    await page.goto('/?priority=high')

    await expect(page.getByText('Žádné poznámky s prioritou „Vysoká“.')).toBeVisible()
  })

  test('falls back to all notes for an unknown priority in the URL', async ({ page }) => {
    await seedNotes(sampleNotes)
    await page.goto('/?priority=urgent')

    await expect(priorityFilter(page).getByRole('radio', { name: 'Vše' })).toBeChecked()
    await expect(noteTitles(page)).toHaveCount(3)
  })

  test('shows an error with a working retry when the API fails', async ({ page }) => {
    await seedNotes(sampleNotes)
    await page.route(isNotesApi, (route) => route.fulfill({ status: 500 }))
    await page.goto('/')

    await expect(page.getByText('Poznámky se nepodařilo načíst.')).toBeVisible({ timeout: 15_000 })

    await page.unroute(isNotesApi)
    await page.getByRole('button', { name: 'Zkusit znovu' }).click()
    await expect(noteTitles(page)).toHaveCount(3)
  })
})
