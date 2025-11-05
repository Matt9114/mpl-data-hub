import type { WorkerHistoryRow } from '~/lib/ewm/types'
export function useEwmWorkerHistory(skip = 0, limit = 10000) {
  const base = useRuntimeConfig().public.ewm.baseURL
  const { data, pending, error, refresh } = useAsyncData<WorkerHistoryRow[]>(
    `ewm:workerHistory:${skip}:${limit}`,
    () => $fetch(`${base}/api/data/workers_history`, { query: { skip, limit } }),
    { server: true, default: () => [] }
  )
  return { workerHistory: data, loading: pending, error, refresh }
}
