import { TITLE_MAX, type Priority } from '@notes/shared'
import { PRIORITY_LABEL, PRIORITY_ORDER } from '#/notes/priority.ts'
import { MainButtonStyle, SecondaryButtonStyle } from '#/shared/MainButton.tsx'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { createNote } from '#/api/notes.ts'
import { notesKeys } from '#/notes/useNotes.ts'
import { useQueryClient } from '@tanstack/react-query'

const fieldStyle =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200'

export function CreateNote() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const id = useId()

  useEffect(() => {
    if (!modalOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalOpen])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    try {
      await createNote({ title, content, priority })
      await queryClient.invalidateQueries({ queryKey: notesKeys.all })
      setModalOpen(false)
    } catch (error) {
      console.error(error)
      setError('Při vytváření poznámky došlo k chybě')
    } finally {
      setTitle('')
      setContent('')
      setPriority('medium')
      setError('')
      setIsLoading(false)
    }
  }

  return (
    <>
      <button type="button" className={MainButtonStyle} onClick={() => setModalOpen(true)}>
        + Přidat poznámku
      </button>
      {modalOpen && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-heading`}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="mb-5 flex items-center justify-between">
              <h2 id={`${id}-heading`} className="text-lg font-semibold text-stone-900">
                Nová poznámka
              </h2>
              <button
                type="button"
                aria-label="Zavřít"
                onClick={() => setModalOpen(false)}
                className="cursor-pointer rounded-md p-1 text-xl leading-none text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                ×
              </button>
            </header>

            <form onSubmit={(e) => handleSubmit(e)} className="grid gap-4">
              <div className="grid gap-1.5">
                <div className="flex items-baseline justify-between">
                  <label htmlFor={`${id}-title`} className="text-sm font-medium text-stone-700">
                    Název
                  </label>
                  <span className="text-xs text-stone-400">
                    {title.length}/{TITLE_MAX}
                  </span>
                </div>
                <input
                  id={`${id}-title`}
                  type="text"
                  required
                  autoFocus
                  maxLength={TITLE_MAX}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Např. Objednat se k zubaři"
                  className={fieldStyle}
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor={`${id}-content`} className="text-sm font-medium text-stone-700">
                  Obsah
                </label>
                <textarea
                  id={`${id}-content`}
                  rows={5}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Podrobnosti, které nechcete zapomenout…"
                  className={`${fieldStyle} resize-y`}
                />
              </div>

              <fieldset className="grid gap-1.5">
                <legend className="mb-1.5 text-sm font-medium text-stone-700">Priorita</legend>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-stone-100 p-1">
                  {PRIORITY_ORDER.map((p) => (
                    <label
                      key={p}
                      className="cursor-pointer rounded-md px-3 py-1.5 text-center text-sm font-medium text-stone-600 transition hover:text-stone-900 has-checked:bg-white has-checked:text-stone-900 has-checked:shadow-sm has-focus-visible:ring-2 has-focus-visible:ring-stone-300"
                    >
                      <input
                        type="radio"
                        name={`${id}-priority`}
                        value={p}
                        checked={priority === p}
                        onChange={() => setPriority(p)}
                        className="sr-only"
                      />
                      {PRIORITY_LABEL[p]}
                    </label>
                  ))}
                </div>
              </fieldset>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
                >
                  {error}
                </p>
              )}

              <footer className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className={SecondaryButtonStyle}
                  onClick={() => setModalOpen(false)}
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${MainButtonStyle} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isLoading ? 'Ukládám…' : 'Uložit'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
