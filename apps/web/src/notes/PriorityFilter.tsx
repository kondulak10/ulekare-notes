import type { Priority } from '@notes/shared'
import { PRIORITY_LABEL, PRIORITY_ORDER } from './priority.ts'

type Props = {
  value: Priority | undefined
  onChange: (value: Priority | undefined) => void
}

export function PriorityFilter({ value, onChange }: Props) {
  const options: { value: Priority | undefined; label: string }[] = [
    { value: undefined, label: 'Vše' },
    ...PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] })),
  ]

  return (
    <div
      role="radiogroup"
      aria-label="Filtr podle priority"
      className="flex gap-1 rounded-lg bg-stone-200/70 p-1"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
