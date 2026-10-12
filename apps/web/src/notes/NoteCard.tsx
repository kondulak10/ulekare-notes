import type { Note } from '@notes/shared'
import { PRIORITY_BADGE, PRIORITY_LABEL } from './priority.ts'

const dateFormat = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium', timeStyle: 'short' })

export function NoteCard({ note }: { note: Note }) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-stone-900">{note.title}</h2>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[note.priority]}`}
        >
          {PRIORITY_LABEL[note.priority]}
        </span>
      </header>
      {note.content && (
        <p className="mt-2 whitespace-pre-line text-sm text-stone-600">{note.content}</p>
      )}
      <footer className="mt-3 text-xs text-stone-400">
        Upraveno{' '}
        <time dateTime={note.updatedAt}>{dateFormat.format(new Date(note.updatedAt))}</time>
      </footer>
    </article>
  )
}
