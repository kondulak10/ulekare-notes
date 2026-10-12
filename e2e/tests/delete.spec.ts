import { expect, test } from '@playwright/test'
import { closeDb, countNotes, seedNotes } from '../db.ts'
import { noteCard, noteTitles, sampleNotes } from '../helpers.ts'

test.afterAll(closeDb)

test.describe('deleting a note', () => {
  test.beforeEach(async ({ page }) => {
    await seedNotes(sampleNotes)
    await page.goto('/')
  })

  test('asks for confirmation naming the note, then removes it', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toContain('Vyzvednout recept')
      await dialog.accept()
    })
    await noteCard(page, 'Vyzvednout recept').getByRole('button', { name: 'Smazat' }).click()

    await expect(noteCard(page, 'Vyzvednout recept')).toHaveCount(0)
    await expect(noteTitles(page)).toHaveCount(sampleNotes.length - 1)

    await page.reload()
    await expect(noteCard(page, 'Vyzvednout recept')).toHaveCount(0)
  })

  test('keeps the note when the confirmation is cancelled', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.dismiss())
    await noteCard(page, 'Vyzvednout recept').getByRole('button', { name: 'Smazat' }).click()

    await expect(noteCard(page, 'Vyzvednout recept')).toBeVisible()
    expect(await countNotes()).toBe(sampleNotes.length)
  })

  test('shows the empty state after deleting the last note', async ({ page }) => {
    await seedNotes([sampleNotes[0]!])
    await page.reload()
    page.once('dialog', (dialog) => dialog.accept())
    await noteCard(page, sampleNotes[0]!.title).getByRole('button', { name: 'Smazat' }).click()

    await expect(page.getByText('Zatím tu nejsou žádné poznámky.')).toBeVisible()
  })
})
