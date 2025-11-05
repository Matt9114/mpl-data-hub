// lib/ewm/types.ts

export type TaskRow = {
  type: string
  status: 'idle' | 'queued' | 'running' | null
  last_run_status: 'success' | 'failed' | null
  run_count: number
  fail_count: number
  last_run_start: string | null
  last_run_end: string | null
  allocated_to_worker: number | null
  request_id: string | null
  last_run_stage: string | null
  last_error_message: string | null
  current_retry: number
  max_retries: number
  retry_at: string | null
}
// Pole a polia ako v tvojej /api/data/tasks odpovedi. :contentReference[oaicite:0]{index=0}

export type SessionRow = {
  id: number
  string_id: string
  gui_status: 'open' | 'closed' | string | null
  session_status: 'idle' | 'busy' | 'error' | 'stopped' | string | null
  allocated_to_worker: number | null
  // niektoré polia máš v UI, ale nemusia chodiť v /sessions – nechajme voliteľné:
  created_at?: string | null
  last_usage?: string | null
}
// Tvar podľa tvojej /api/data/sessions ukážky. :contentReference[oaicite:1]{index=1}

export type WorkerRow = {
  id: number
  worker_id: number
  status: 'running' | 'dead' | 'stopped' | 'unknown'
  started_at: string | null
  stopped_at: string | null
  last_heartbeat: string | null
  // voliteľné – mal si ich v mocku
  worker_module?: string | null
  worker_session_id?: string | null
}
// Základ podľa tvojej /api/data/workers odpovede. :contentReference[oaicite:2]{index=2}

export type TaskHistoryRow = {
  id: number
  task_type: string
  worker_id: number | null
  status: 'done' | 'failed' | string
  start_time: string
  end_time: string | null
  error_message: string | null
  request_id: string | null
} // :contentReference[oaicite:3]{index=3}

export type SessionHistoryRow = {
  id: number
  timestamp: string
  session_string_id: string
  worker_id: number | null
  status: 'ALLOCATED' | 'BUSY' | 'IDLE' | 'CLOSED' | string
  task_type: string | null
} // :contentReference[oaicite:4]{index=4}

export type WorkerHistoryRow = {
  id: number
  timestamp: string
  worker_id: number
  status: 'STARTED' | 'STOPPED' | 'DIED' | string
  details: string | null
} // :contentReference[oaicite:5]{index=5}

export type TimelineItem = {
  source: 'audit_events' | 'session_history' | string
  ts: string
  entity: 'task' | 'session' | 'worker' | string
  entity_id: string
  event: string
  stage: string | null
  status: string | null
  message: string | null
  payload: Record<string, unknown> | null
}

export type RequestTimeline = {
  request_id: string
  items: TimelineItem[]
} // :contentReference[oaicite:6]{index=6}

export type BatchTimeline = {
  batch_id: string
  items: TimelineItem[]
} // :contentReference[oaicite:7]{index=7}
