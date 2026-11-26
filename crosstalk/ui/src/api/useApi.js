import { useCallback, useEffect, useState } from 'react'

// Runs an api function and tracks its state: { data, loading, error, retry }.
// `fn` is called again when `deps` change or when retry() is called.
// Pass fn = null to skip the call (data stays null, loading false).
export function useApi(fn, deps = []) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ data: null, loading: fn != null, error: null })

  useEffect(() => {
    if (fn == null) return undefined
    let cancelled = false
    // Old data is dropped on every reload, so a page never shows data for another id.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ data: null, loading: true, error: null })
    fn().then(
      (data) => !cancelled && setState({ data, loading: false, error: null }),
      (error) => !cancelled && setState({ data: null, loading: false, error }),
    )
    return () => {
      cancelled = true
    }
    // `fn` is a new closure on every render, so only the caller's `deps` decide when to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}
