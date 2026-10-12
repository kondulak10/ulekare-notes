import { prioritySchema } from '@notes/shared'
import { useSearchParam } from './lib/useSearchParam.ts'
import { NoteList } from './notes/NoteList.tsx'
import { PriorityFilter } from './notes/PriorityFilter.tsx'

export default function App() {
  const [priorityParam, setPriorityParam] = useSearchParam('priority')
  const priority = prioritySchema.safeParse(priorityParam).data

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Poznámky</h1>
        <PriorityFilter value={priority} onChange={(p) => setPriorityParam(p ?? null)} />
      </header>
      <NoteList priority={priority} />
    </main>
  )
}
