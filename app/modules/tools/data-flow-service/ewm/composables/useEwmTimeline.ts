import type { RequestTimeline } from '~/lib/ewm/types'
export function useEwmTimeline(requestId: string, limit = 10000) {
  const base = useRuntimeConfig().public.ewm.baseURL
  const key = `ewm:timeline:${requestId}:${limit}`

  const { data, pending, error, refresh } = useAsyncData<RequestTimeline>(
    key,
    () => $fetch(`${base}/requests/${requestId}/timeline`, { query: { limit } }),
    { server: true, default: () => ({ request_id: requestId, items: [] }) }
  )
  return { timeline: data, loading: pending, error, refresh }
}
