import type { BatchTimeline } from '~/lib/ewm/types'
export function useEwmBatchTimeline(batchId: string, limit = 10000) {
  const base = useRuntimeConfig().public.ewm.baseURL
  const key = `ewm:batchTimeline:${batchId}:${limit}`

  const { data, pending, error, refresh } = useAsyncData<BatchTimeline>(
    key,
    () => $fetch(`${base}/requests/batches/${batchId}/timeline`, { query: { limit } }),
    { server: true, default: () => ({ batch_id: batchId, items: [] }) }
  )
  return { batchTimeline: data, loading: pending, error, refresh }
}
