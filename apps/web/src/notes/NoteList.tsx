import type { Priority } from '@notes/shared'
import { NoteCard } from './NoteCard.tsx'
import { PRIORITY_LABEL } from './priority.ts'
import { useNotes } from './useNotes.ts'

export function NoteList({ priority }: { priority: Priority | undefined }) {
  const { data: notes, isPending, isError, refetch } = useNotes({ priority })

  if (isPending) return <p className="text-sm text-stone-500">Načítám poznámky…</p>

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        Poznámky se nepodařilo načíst.{' '}
        <button type="button" onClick={() => refetch()} className="font-medium underline">
          Zkusit znovu
        </button>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
        {priority ? `Žádné poznámky s prioritou „${PRIORITY_LABEL[priority]}“.` : 'Zatím tu nejsou žádné poznámky.'}
      </p>
    )
  }

  return (
    <ul className="grid gap-3">
      {notes.map((note) => (
        <li key={note.id}>
          <NoteCard note={note} />
        </li>
      ))}
    </ul>
  )
}
