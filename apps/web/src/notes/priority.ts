import type { Priority } from '@notes/shared'

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'Vysoká',
  medium: 'Střední',
  low: 'Nízká',
}

export const PRIORITY_BADGE: Record<Priority, string> = {
  high: 'bg-rose-100 text-rose-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-stone-200 text-stone-700',
}

// Display order for filters: most important first
export const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low']
