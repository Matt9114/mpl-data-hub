<!-- app/modules/tools/data-flow-service/ewm/components/Workers/WorkersView.vue -->
<template>
  <section class="workers-card">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="left">
        <div class="search-wrap">
          <MagnifyingGlassIcon class="icon" aria-hidden="true" />
          <input
            v-model="query"
            type="text"
            class="search-input"
            placeholder="Hľadať podľa workera..."
            aria-label="Hľadať worker"
          />
          <button
            :class="{ 'is-visible': !!query }"
            class="btn btn-secondary clear-btn"
            @click="query = ''"
            title="Vymazať filter"
          >
            <XMarkIcon class="icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="right">
        <span class="count muted">{{ filteredWorkers.length }}/{{ totalCount }}</span>
        <button
          class="btn btn-primary"
          :disabled="!canBatchRestart"
          @click="batchRestart"
          title="Reštart vybrané"
        >
          <SquaresPlusIcon class="btn-icon" aria-hidden="true" />
          Restart vybrané ({{ selectedIds.length }})
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <!-- Status -->
      <div class="filter-group">
        <span class="group-label">Status</span>
        <div class="segmented">
          <button
            v-for="s in STATUS_OPTIONS"
            :key="s"
            type="button"
            class="seg-btn"
            :class="{ 'is-active': statusFilters.has(s) }"
            @click="toggleStatus(s)"
            :title="`Filtrovať: ${STATUS_LABELS[s]}`"
          >
            <span class="seg-label">{{ STATUS_LABELS[s] }}</span>
            <span class="seg-count">{{ counts.status[s] || 0 }}</span>
          </button>
        </div>
      </div>

      <!-- Extras -->
      <div class="filter-extras">
        <label class="chk">
          <input type="checkbox" v-model="onlyStale" />
          <span>Iba stale heartbeat (&gt; {{ STALE_SEC }}s)</span>
        </label>

        <button
          class="btn btn-secondary"
          :disabled="!hasActiveFilters"
          @click="resetFilters"
          title="Vyčistiť filtre"
        >
          Reset filtrov
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="workers-table">
        <thead>
          <tr>
            <th class="checkbox">
              <input
                type="checkbox"
                :checked="isClient && allSelected"
                :disabled="!isClient || filteredWorkers.length === 0"
                @change="toggleSelectAll"
                aria-label="Vybrať všetko"
              />
            </th>

            <th @click="toggleSort('worker_id')">
              <span class="th-inner">
                <span>Worker</span>
                <span v-if="sortBy==='worker_id'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('worker_session_id')">
              <span class="th-inner">
                <span>Session</span>
                <span v-if="sortBy==='worker_session_id'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('worker_module')">
              <span class="th-inner">
                <span>Module</span>
                <span v-if="sortBy==='worker_module'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('status')">
              <span class="th-inner">
                <span>Status</span>
                <span v-if="sortBy==='status'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('last_heartbeat')">
              <span class="th-inner">
                <span>Last Heartbeat</span>
                <span v-if="sortBy==='last_heartbeat'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('started_at')">
              <span class="th-inner">
                <span>Started</span>
                <span v-if="sortBy==='started_at'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('stopped_at')">
              <span class="th-inner">
                <span>Stopped</span>
                <span v-if="sortBy==='stopped_at'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>

            <th class="no-sort">Akcie</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="w in sortedWorkers" :key="w.id">
            <td class="checkbox">
              <input
                type="checkbox"
                :value="w.id"
                v-model="selectedIds"
                :disabled="isClient && !canBeStartedOrRestarted(w)"
                :aria-label="`Vybrať worker ${w.worker_id}`"
              />
            </td>

            <td class="num">{{ w.worker_id }}</td>
            <td class="mono">{{ w.worker_session_id || '—' }}</td>
            <td>{{ w.worker_module }}</td>

            <td>
              <span class="badge" :class="`badge--st-${normalizeStatus(w.status)}`">
                {{ w.status || 'unknown' }}
              </span>
              <span
                v-if="isClient && isStaleClient(w)"
                class="badge badge--st-stale"
                title="Heartbeat je starší ako limit"
              >
                Stale
              </span>
            </td>

            <td class="mono">{{ formatDate(w.last_heartbeat) }}</td>
            <td class="mono">{{ formatDate(w.started_at) }}</td>
            <td class="mono">{{ formatDate(w.stopped_at) }}</td>

            <td class="actions-cell">
              <button
                v-if="canStart(w)"
                class="btn btn-primary btn-sm"
                @click="start(w)"
                title="Spustiť"
              >
                <PlayIcon class="btn-icon" aria-hidden="true" />
                Start
              </button>

              <button
                v-if="canRestart(w)"
                class="btn btn-primary btn-sm"
                @click="restart(w)"
                title="Reštartovať"
              >
                <ArrowPathIcon class="btn-icon" aria-hidden="true" />
                Restart
              </button>

              <button
                class="btn btn-secondary btn-sm"
                :disabled="isClient && !canStop(w)"
                @click="stop(w)"
                title="Stopnúť"
              >
                <StopIcon class="btn-icon" aria-hidden="true" />
                Stop
              </button>
            </td>
          </tr>

          <tr v-if="!loading && sortedWorkers.length === 0">
            <td class="empty" colspan="9">Žiadne záznamy pre daný filter.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { isClient } from '@vueuse/core'
import {
  ChevronUpIcon, ChevronDownIcon,
  SquaresPlusIcon, XMarkIcon, MagnifyingGlassIcon,
  ArrowPathIcon, PlayIcon, StopIcon
} from '@heroicons/vue/20/solid'

import type { WorkerRow } from '~/lib/ewm/types'

// ✅ composable berieme AUTO-IMPORTOM z modulu EWM (žiadny ručný import zo shared)
const { workers, loading, error, refresh } = useEwmWorkers()

type Col =
  | 'worker_id' | 'worker_session_id' | 'worker_module'
  | 'status' | 'last_heartbeat' | 'started_at' | 'stopped_at'

type St = 'running' | 'dead' | 'stopped'
const STATUS_OPTIONS: St[] = ['running', 'dead', 'stopped']
const STATUS_LABELS: Record<St, string> = {
  running: 'Running', dead: 'Dead', stopped: 'Stopped'
}
const STALE_SEC = 30

/** ---------- lokálne utility (nezávislé od composablu) ---------- */
const TZ = 'Europe/Bratislava'
const dateFmt = new Intl.DateTimeFormat('sk-SK', {
  timeZone: TZ,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit'
})
function formatDate(val?: string | null) {
  if (!val) return '—'
  const d = new Date(val)
  return Number.isNaN(+d) ? '—' : dateFmt.format(d)
}
function secondsSince(val?: string | null) {
  if (!val) return Infinity
  const t = Date.parse(val)
  if (Number.isNaN(t)) return Infinity
  return Math.floor((Date.now() - t) / 1000)
}

/** ---------- state ---------- */
const query   = ref('')
const sortBy  = ref<Col>('status')
const sortDir = ref<'asc'|'desc'>('asc')
const selectedIds = ref<number[]>([])

const statusFilters = ref<Set<St>>(new Set())
const onlyStale = ref(false)

/** ---------- derived ---------- */
const totalCount = computed(() => workers.value.length)

const baseList = computed<WorkerRow[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return workers.value as WorkerRow[]
  return (workers.value as WorkerRow[]).filter((w) =>
    String(w.worker_id ?? '').includes(q) ||
    (w.worker_session_id ?? '').toLowerCase().includes(q) ||
    (w.worker_module ?? '').toLowerCase().includes(q)
  )
})

function normalizeStatus(s?: WorkerRow['status'] | string | null): 'running'|'dead'|'stopped'|'unknown' {
  const v = (s || 'unknown').toString().toLowerCase()
  return v === 'running' || v === 'dead' || v === 'stopped' ? v : 'unknown'
}

const counts = computed(() => {
  const status = { running: 0, dead: 0, stopped: 0 } as Record<St, number>
  for (const w of baseList.value) {
    const s = normalizeStatus(w.status)
    if (s in status) status[s as St]++
  }
  return { status }
})

function isStaleClient(w: WorkerRow) {
  return isClient && secondsSince(w.last_heartbeat) > STALE_SEC
}

const filteredWorkers = computed<WorkerRow[]>(() => {
  let arr: WorkerRow[] = [...baseList.value]
  if (statusFilters.value.size > 0) {
    arr = arr.filter((w) => statusFilters.value.has(normalizeStatus(w.status) as St))
  }
  if (onlyStale.value) {
    arr = arr.filter((w) => isStaleClient(w))
  }
  return arr
})

/** ---------- sort ---------- */
const statusRank: Record<'running'|'stopped'|'dead'|'unknown', number> = {
  running: 0, stopped: 1, dead: 2, unknown: 99
}

function compare(a: WorkerRow, b: WorkerRow, col: Col) {
  if (col === 'status') {
    return (statusRank[normalizeStatus(a.status)] ?? 99)
         - (statusRank[normalizeStatus(b.status)] ?? 99)
  }
  if (col === 'last_heartbeat' || col === 'started_at' || col === 'stopped_at') {
    const ta = a[col] ? Date.parse(a[col] as string) : Infinity
    const tb = b[col] ? Date.parse(b[col] as string) : Infinity
    return ta - tb
  }
  if (col === 'worker_id') return (a.worker_id ?? 0) - (b.worker_id ?? 0)
  return (a[col] ?? '').toString().localeCompare((b[col] ?? '').toString())
}

const sortedWorkers = computed<WorkerRow[]>(() => {
  const arr = [...filteredWorkers.value]
  arr.sort((a, b) => {
    const base = compare(a, b, sortBy.value)
    return sortDir.value === 'asc' ? base : -base
  })
  return arr
})

function toggleSort(col: Col) {
  if (sortBy.value === col) sortDir.value = (sortDir.value === 'asc' ? 'desc' : 'asc')
  else { sortBy.value = col; sortDir.value = 'asc' }
}

/** ---------- Akcie ---------- */
function canStart(w: WorkerRow)   { return normalizeStatus(w.status) === 'stopped' }
function canRestart(w: WorkerRow) { return normalizeStatus(w.status) === 'dead' }
function canStop(w: WorkerRow)    { return normalizeStatus(w.status) === 'running' }
function canBeStartedOrRestarted(w: WorkerRow) { return canStart(w) || canRestart(w) }

function start(w: WorkerRow) {
  if (!canStart(w)) return
  w.status = 'running'
  w.started_at = new Date().toISOString()
  w.stopped_at = null
}
function restart(w: WorkerRow) {
  if (!canRestart(w)) return
  w.status = 'running'
  w.started_at = new Date().toISOString()
  w.stopped_at = null
}
function stop(w: WorkerRow) {
  if (!canStop(w)) return
  w.status = 'stopped'
  w.stopped_at = new Date().toISOString()
}

/** ---------- Výber / batch ---------- */
const allSelected = computed(() => {
  if (!isClient) return false
  const eligible = sortedWorkers.value.filter((w) => canBeStartedOrRestarted(w)).map((w) => w.id)
  return eligible.length > 0 && eligible.every(id => selectedIds.value.includes(id))
})

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (!checked) { selectedIds.value = []; return }
  selectedIds.value = sortedWorkers.value.filter((w) => canBeStartedOrRestarted(w)).map((w) => w.id)
}

const canBatchRestart = computed(() => selectedIds.value.length > 0)

function batchRestart() {
  for (const w of sortedWorkers.value) {
    if (selectedIds.value.includes(w.id)) {
      if (canStart(w)) start(w)
      else if (canRestart(w)) restart(w)
    }
  }
  selectedIds.value = []
}

/** ---------- Filtre helpers ---------- */
function toggleStatus(s: St) {
  const set = new Set(statusFilters.value)
  set.has(s) ? set.delete(s) : set.add(s)
  statusFilters.value = set
}

const hasActiveFilters = computed(() =>
  !!query.value || statusFilters.value.size > 0 || onlyStale.value
)

function resetFilters() {
  query.value = ''
  statusFilters.value.clear()
  onlyStale.value = false
}
</script>

<style scoped>
/* Layout */
.workers-card { display:flex; flex-direction:column; gap:.5rem; flex:1 1 0; min-height:0; }

/* Toolbar */
.toolbar{ display:flex; justify-content:space-between; align-items:center; gap:.75rem; padding:.25rem 0 .25rem; flex:0 0 auto; }
.left,.right{ display:inline-flex; align-items:center; gap:.5rem; }
.count.muted{ color:#64748b; font-size:.85rem; }

/* Search */
.search-wrap {
  display:inline-flex; align-items:center; gap:.35rem;
  border:1px solid var(--search-border-color); background:var(--sidebar-via);
  padding:0 .75rem; border-radius:.6rem; height:2rem; box-sizing:border-box;
}
.search-input { border:none; outline:none; background:transparent; color:var(--search-text-color); min-width:280px; font-size:0.9rem; }
.search-input::placeholder { color: var(--placeholder-color); opacity:.8; }
.icon { width:0.9rem; height:0.9rem; }

.btn.clear-btn {
  padding:0; background:transparent; border:none; box-shadow:none;
  display:flex; align-items:center; justify-content:center;
  visibility:hidden; transition:visibility 0s, opacity .2s ease; opacity:0;
}
.btn.clear-btn.is-visible { visibility:visible; opacity:1; cursor:pointer; }

/* Filters */
.filters{ display:grid; grid-template-columns: 1fr auto; align-items:center; gap:.75rem; padding:.25rem .25rem .5rem; }
.filter-group{ display:flex; align-items:center; gap:.5rem; }
.group-label{ color:#475569; font-weight:700; font-size:.82rem; }

.segmented{ display:inline-flex; gap:.35rem; flex-wrap:wrap; }
.seg-btn{ display:inline-flex; align-items:center; gap:.4rem; padding:.35rem .55rem; border-radius:.5rem; border:1px solid #e2e8f0; background:#f8fafc; color:#334155; font-size:.78rem; font-weight:600; cursor:pointer; transition:all .15s ease; }
.seg-btn:hover{ background:#eef2f7; }
.seg-btn.is-active{ background:#e6f0ff; border-color:#bfdbfe; color:#1d4ed8; box-shadow:0 0 0 2px rgba(29,78,216,.08) inset; }
.seg-label{ line-height:1; }
.seg-count{ min-width:1.4em; padding:0 .35em; border-radius:.75rem; background:#e2e8f0; font-weight:700; font-size:.72rem; text-align:center; }
.seg-btn.is-active .seg-count{ background:#bfdbfe; }

.filter-extras{ display:inline-flex; align-items:center; gap:.5rem; justify-content:flex-end; }
.chk{ display:inline-flex; align-items:center; gap:.4rem; font-size:.85rem; color:#334155; }

/* Buttons */
.btn{ display:inline-flex; align-items:center; gap:.4rem; padding:.45rem .8rem; border-radius:.6rem; cursor:pointer; font-size:.82rem; font-weight:700; border:1px solid transparent; transition:all .2s ease; }
.btn:focus-visible{ outline:2px solid #93c5fd; outline-offset:2px; }
.btn-icon{ width:1rem; height:1rem; }
.btn-primary{ background:#2563eb; color:#fff; border-color:#2563eb; }
.btn-primary:hover{ background:#1d4ed8; transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,.2); }
.btn-secondary{ background:#f1f5f9; color:#475569; border-color:#e2e8f0; }
.btn-secondary:hover{ background:#e2e8f0; }
.btn-sm{ padding:.28rem .5rem; font-size:.76rem; }
.btn:disabled{ opacity:.55; cursor:not-allowed; }

/* Table container */
.table-wrap{ flex:1 1 0; min-height:0; overflow:auto; border:1px solid var(--search-border-color); border-radius:.6rem; background:#fff; }

/* Table */
.workers-table{ width:100%; border-collapse:separate; border-spacing:0; font-size:.7rem; }
.workers-table thead th{ position:sticky; top:0; z-index:1; background:#f1f5f9; color:#334155; font-weight:700; text-align:left; border-bottom:1px solid #e2e8f0; padding:.6rem .65rem; user-select:none; cursor:pointer; }
.workers-table thead th.no-sort{ cursor:default; }
.th-inner{ display:inline-flex; align-items:center; gap:.35rem; }
.sort-icon .icon{ width:.9rem; height:.9rem; }

.workers-table tbody td{ border-bottom:1px solid #eef2f7; padding:.55rem .65rem; color:#334155; }
.workers-table tbody tr:nth-child(even){ background:#fbfdff; }
.workers-table tbody tr:hover{ background:#f5f8ff; }

.checkbox{ width:36px; }

/* Mono / num */
.num{ text-align:center; font-variant-numeric:tabular-nums; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }

/* Badges */
.badge{ display:inline-block; padding:.22rem .5rem; border-radius:.25rem; font-weight:600; font-size:.72rem; text-transform:capitalize; line-height:1; margin-right:.35rem; }
.badge--st-running{ background: rgba(34,197,94,.18); color:#15803d; border-color:rgba(34,197,94,.35); }
.badge--st-stopped{ background: rgba(148,163,184,.20); color:#475569; border-color:rgba(148,163,184,.35); }
.badge--st-dead{ background: rgba(239,68,68,.18); color:#991b1b; border-color:rgba(239,68,68,.35); }
.badge--st-unknown{ background: rgba(148,163,184,.20); color:#475569; }
.badge--st-stale{ background: rgba(251,191,36,.20); color:#92400e; border-color:rgba(251,191,36,.40); }

/* Centrovanie + akcie */
.workers-table th, .workers-table td{ text-align:center; vertical-align:middle; }
.workers-table thead th{ text-align:center !important; }
.workers-table thead th .th-inner{ justify-content:center; }

.actions-cell{ display:flex; justify-content:center; align-items:center; gap:.5rem; }

/* Empty state */
.empty { text-align:center; color:#64748b; padding:1rem; }
</style>
