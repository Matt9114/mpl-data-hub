// app/server/api/ewm/[...path].get.ts
import { defineEventHandler, getQuery, getRequestHeaders, createError } from 'h3'

// Priame importy mockov
import response_tasks from '~/server/mocks/ewm/response_tasks.json'
import response_sessions from '~/server/mocks/ewm/response_sessions.json'
import response_workers from '~/server/mocks/ewm/response_workers.json'
import response_task_history from '~/server/mocks/ewm/response_task_history.json'
import response_session_history from '~/server/mocks/ewm/response_session_history.json'
import response_worker_history from '~/server/mocks/ewm/response_worker_history.json'
import response_timeline from '~/server/mocks/ewm/response_timeline.json'
import response_batch_timeline from '~/server/mocks/ewm/response_batch_timeline.json'

function pickMock(path: string) {
  if (path === 'api/data/tasks')            return response_tasks
  if (path === 'api/data/sessions')         return response_sessions
  if (path === 'api/data/workers')          return response_workers

  if (path === 'api/data/tasks_history')    return response_task_history
  if (path === 'api/data/sessions_history') return response_session_history
  if (path === 'api/data/workers_history')  return response_worker_history

  if (path.startsWith('requests/batches/') && path.endsWith('/timeline')) {
    return response_batch_timeline
  }
  if (path.startsWith('requests/') && path.endsWith('/timeline')) {
    return response_timeline
  }
  return null
}

// Absolútne defenzívne načítanie path bez .join
function readPath(event: any): string {
  const raw = event?.context?.params?.path
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) {
    let out = ''
    for (const part of raw as any[]) {
      out += (out ? '/' : '') + String(part ?? '')
    }
    return out
  }
  return ''
}

export default defineEventHandler(async (event) => {
  const { ewm, ewmUseMock, ewmFallbackToMock } = useRuntimeConfig()

  const path = readPath(event)
  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'Missing path' })
  }

  // UUID validácia pre (batch_)timeline
  if (path.startsWith('requests/') && path.endsWith('/timeline')) {
    const parts = path.split('/')
    const id = parts[1] === 'batches' ? parts[2] : parts[1]
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid UUID' })
    }
  }

  const query = getQuery(event)

  // Mock režim
  if (ewmUseMock) {
    const mock = pickMock(path)
    if (!mock) throw createError({ statusCode: 501, statusMessage: `No mock for ${path}` })
    return mock
  }

  // Proxy na upstream
  const origin = ewm.baseURL.replace(/\/+$/, '')
  const url = `${origin}/${path}`

  try {
    // preposlanie hlavičiek
    const inHeaders = getRequestHeaders(event)
    const headers: Record<string, string> = {}
    for (const [k, v] of Object.entries(inHeaders)) {
      if (typeof v === 'string') headers[k] = v
      else if (Array.isArray(v)) headers[k] = v.join(', ')
    }

    return await $fetch(url, { query, headers })
  } catch (err) {
    if (ewmFallbackToMock) {
      const mock = pickMock(path)
      if (mock) return mock
    }
    throw createError({
      statusCode: 502,
      statusMessage: `Upstream fetch failed for ${url}`,
      data: { cause: String((err as any)?.message || err) },
    })
  }
})
