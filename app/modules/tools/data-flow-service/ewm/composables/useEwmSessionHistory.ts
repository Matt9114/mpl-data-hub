import type { SessionHistoryRow } from '~/lib/ewm/types'
export function useEwmSessionHistory(skip = 0, limit = 10000) {
  const base = useRuntimeConfig().public.ewm.baseURL
  const { data, pending, error, refresh } = useAsyncData<SessionHistoryRow[]>(
    `ewm:sessionHistory:${skip}:${limit}`,
    () => $fetch(`${base}/api/data/sessions_history`, { query: { skip, limit } }),
    { server: true, default: () => [] }
  )
  return { sessionHistory: data, loading: pending, error, refresh }
}
