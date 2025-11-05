import type { TaskRow } from '~/lib/ewm/types'

export function useEwmTasks(skip = 0, limit = 1000) {
  const base = useRuntimeConfig().public.ewm.baseURL
  // kľúč drž malý a deterministický — deduplikácia v SSR
  const key = `ewm:tasks:${skip}:${limit}`

  const { data, pending, error, refresh } = useAsyncData<TaskRow[]>(
    key,
    () => $fetch(`${base}/api/data/tasks`, { query: { skip, limit } }),
    { server: true, default: () => [] }
  )

  return {
    tasks: data,
    loading: pending,
    error,
    refresh
  }
}

import { formatDate } from '~/lib/datetime'

export function useTasksEwm() {
  const api = useEwmTasks(0, 1000)
  return {
    tasks: api.tasks,
    loading: api.loading,
    error: api.error,
    load: api.refresh,
    refresh: api.refresh,
    formatDate,
  }
}
