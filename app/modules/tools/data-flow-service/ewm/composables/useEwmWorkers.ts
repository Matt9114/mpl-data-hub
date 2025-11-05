import type { WorkerRow } from '~/lib/ewm/types'

export function useEwmWorkers(skip = 0, limit = 1000) {
  const base = useRuntimeConfig().public.ewm.baseURL
  const key = `ewm:workers:${skip}:${limit}`

  const { data, pending, error, refresh } = useAsyncData<WorkerRow[]>(
    key,
    () => $fetch(`${base}/api/data/workers`, { query: { skip, limit } }),
    { server: true, default: () => [] }
  )

  return { workers: data, loading: pending, error, refresh }
}

// alias so starým názvom + zachovanie API tvaru
import { formatDate, secondsSince } from '~/lib/datetime'

export function useWorkersEwm() {
  const api = useEwmWorkers(0, 1000) // default paging ako doteraz
  return {
    workers: api.workers,
    loading: api.loading,
    error: api.error,
    // starý názov metódy:
    load: api.refresh,
    // nové meno nechávame k dispozícii tiež:
    refresh: api.refresh,
    // helpery ako kedysi:
    formatDate,
    secondsSince,
  }
}
