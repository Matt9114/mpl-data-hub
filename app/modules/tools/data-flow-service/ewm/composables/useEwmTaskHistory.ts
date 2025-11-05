import type { TaskHistoryRow } from '~/lib/ewm/types'
export function useEwmTaskHistory(skip = 0, limit = 10000) {
  const base = useRuntimeConfig().public.ewm.baseURL
  const { data, pending, error, refresh } = useAsyncData<TaskHistoryRow[]>(
    `ewm:taskHistory:${skip}:${limit}`,
    () => $fetch(`${base}/api/data/tasks_history`, { query: { skip, limit } }),
    { server: true, default: () => [] }
  )
  return { taskHistory: data, loading: pending, error, refresh }
}
