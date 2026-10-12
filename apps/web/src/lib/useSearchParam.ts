import { useCallback, useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

// Keeps a piece of UI state in the URL, so a filtered view survives a reload and can be shared.
export function useSearchParam(name: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(subscribe, () =>
    new URLSearchParams(window.location.search).get(name),
  )

  const setValue = useCallback(
    (next: string | null) => {
      const url = new URL(window.location.href)
      if (next === null) url.searchParams.delete(name)
      else url.searchParams.set(name, next)
      window.history.pushState(null, '', url)
      window.dispatchEvent(new PopStateEvent('popstate'))
    },
    [name],
  )

  return [value, setValue]
}
