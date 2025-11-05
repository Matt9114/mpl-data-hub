import type { SessionRow } from '~/lib/ewm/types'

export function useEwmSessions(skip = 0, limit = 1000) {
  const base = useRuntimeConfig().public.ewm.baseURL
  const key = `ewm:sessions:${skip}:${limit}`

  const { data, pending, error, refresh } = useAsyncData<SessionRow[]>(
    key,
    () => $fetch(`${base}/api/data/sessions`, { query: { skip, limit } }),
    { server: true, default: () => [] }
  )

  return { sessions: data, loading: pending, error, refresh }
}

import { formatDate } from '~/lib/datetime'

export function useSessionsEwm() {
  const api = useEwmSessions(0, 1000)
  return {
    sessions: api.sessions,
    loading: api.loading,
    error: api.error,
    load: api.refresh,
    refresh: api.refresh,
    formatDate,
  }
}
