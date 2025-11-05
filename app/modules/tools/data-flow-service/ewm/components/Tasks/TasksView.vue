<!-- app/modules/tools/data-flow-service/ewm/components/Tasks/TasksView.vue -->
<template>
  <section class="tasks-card">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="left">
        <div class="search-wrap">
          <MagnifyingGlassIcon class="icon" aria-hidden="true" />
          <input
            v-model="query"
            type="text"
            class="search-input"
            placeholder="Hľadať podľa tasku..."
            aria-label="Hľadať podľa tasku"
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
        <span class="count muted">{{ filteredTasks.length }}/{{ totalCount }}</span>
        <button
          class="btn btn-primary"
          :disabled="!canBatchQueue"
          @click="batchQueue"
          title="Queue vybrané"
        >
          <SquaresPlusIcon class="btn-icon" aria-hidden="true" />
          Queue vybrané ({{ selectedIds.length }})
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
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

      <div class="filter-group">
        <span class="group-label">Posledný beh</span>
        <div class="segmented">
          <button
            v-for="lr in LASTRUN_OPTIONS"
            :key="lr"
            type="button"
            class="seg-btn"
            :class="{ 'is-active': lastRunFilters.has(lr) }"
            @click="toggleLastRun(lr)"
            :title="`Filtrovať: ${LASTRUN_LABELS[lr]}`"
          >
            <span class="seg-label">{{ LASTRUN_LABELS[lr] }}</span>
            <span class="seg-count">{{ counts.lastRun[lr] || 0 }}</span>
          </button>
        </div>
      </div>

      <div class="filter-extras">
        <label class="chk">
          <input type="checkbox" v-model="onlyQueueable" />
          <span>Iba queueovateľné</span>
        </label>

        <button
          class="btn btn-secondary"
          :disabled="!hasActiveFilters"
          @click="resetFilters"
          title="Vyčistiť všetky filtre"
        >
          Reset filtrov
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="tasks-table">
        <thead>
          <tr>
            <th class="checkbox">
              <input
                type="checkbox"
                :checked="isClient && allSelected"
                :disabled="!isClient || filteredTasks.length === 0"
                @change="toggleSelectAll"
                aria-label="Vybrať všetko"
              />
            </th>

            <th @click="toggleSort('type')">
              <span class="th-inner">
                <span>Type</span>
                <span v-if="sortBy === 'type'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" aria-hidden="true" />
                  <ChevronDownIcon v-else class="icon" aria-hidden="true" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('status')">
              <span class="th-inner">
                <span>Status</span>
                <span v-if="sortBy === 'status'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" aria-hidden="true" />
                  <ChevronDownIcon v-else class="icon" aria-hidden="true" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('last_run_status')">
              <span class="th-inner">
                <span>Last Run Status</span>
                <span v-if="sortBy === 'last_run_status'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" aria-hidden="true" />
                  <ChevronDownIcon v-else class="icon" aria-hidden="true" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('run_count')">
              <span class="th-inner">
                <span>Run Count</span>
                <span v-if="sortBy === 'run_count'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" aria-hidden="true" />
                  <ChevronDownIcon v-else class="icon" aria-hidden="true" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('fail_count')">
              <span class="th-inner">
                <span>Fail Count</span>
                <span v-if="sortBy === 'fail_count'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" aria-hidden="true" />
                  <ChevronDownIcon v-else class="icon" aria-hidden="true" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('last_run_start')">
              <span class="th-inner">
                <span>Last Run Start</span>
                <span v-if="sortBy === 'last_run_start'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" aria-hidden="true" />
                  <ChevronDownIcon v-else class="icon" aria-hidden="true" />
                </span>
              </span>
            </th>

            <th @click="toggleSort('last_run_end')">
              <span class="th-inner">
                <span>Last Run End</span>
                <span v-if="sortBy === 'last_run_end'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" aria-hidden="true" />
                  <ChevronDownIcon v-else class="icon" aria-hidden="true" />
                </span>
              </span>
            </th>

            <th><span class="th-inner"><span>Allocated Worker</span></span></th>
            <th><span class="th-inner"><span>Request ID</span></span></th>
            <th class="no-sort">Akcie</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="t in sortedTasks" :key="t.type">
            <td class="checkbox">
              <input
                type="checkbox"
                :value="t.type"
                v-model="selectedIds"
                :disabled="isClient && !canQueue(t)"
                :aria-label="`Vybrať ${t.type}`"
              />
            </td>

            <td class="mono">{{ t.type }}</td>

            <td>
              <span class="badge" :class="`badge--${t.status || 'idle'}`">
                {{ t.status || 'idle' }}
              </span>
            </td>

            <td>
              <span class="badge" :class="`badge--lr-${t.last_run_status || 'none'}`">
                {{ t.last_run_status || '—' }}
              </span>
            </td>

            <td class="num">{{ t.run_count }}</td>
            <td class="num">{{ t.fail_count }}</td>

            <td class="mono">{{ formatDateStable(t.last_run_start) }}</td>
            <td class="mono">{{ formatDateStable(t.last_run_end) }}</td>

            <td>{{ t.allocated_to_worker ?? '—' }}</td>
            <td class="mono">{{ t.request_id ?? '—' }}</td>

            <td>
              <button
                class="btn btn-primary btn-sm"
                :disabled="isClient && !canQueue(t)"
                @click="queueTask(t)"
                title="Zaradiť do fronty"
              >
                <PlusCircleIcon class="btn-icon" aria-hidden="true" />
                Queue
              </button>
            </td>
          </tr>

          <tr v-if="!loading && sortedTasks.length === 0">
            <td class="empty" colspan="11">Žiadne záznamy pre daný filter.</td>
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
  PlusCircleIcon, SquaresPlusIcon,
  XMarkIcon, MagnifyingGlassIcon
} from '@heroicons/vue/20/solid'

import type { TaskRow } from '~/lib/ewm/types'

// ✅ jediný composable (auto-import z modulu EWM)
const { tasks, loading, error, refresh } = useEwmTasks({ skip: 0, limit: 1000 })

type Col =
  | 'type' | 'status' | 'last_run_status'
  | 'run_count' | 'fail_count'
  | 'last_run_start' | 'last_run_end'

type Status = 'running' | 'queued' | 'idle'
type LastRun = 'success' | 'failed' | 'none'

const STATUS_LABELS: Record<Status, string> = {
  running: 'Beží',
  queued:  'Vo fronte',
  idle:    'Nečinné'
}
const LASTRUN_LABELS: Record<LastRun, string> = {
  success: 'Dokončené',
  failed:  'Zlyhané',
  none:    'Bez behu'
}
const STATUS_OPTIONS: Status[] = ['running', 'queued', 'idle']
const LASTRUN_OPTIONS: LastRun[] = ['success', 'failed', 'none']

/** ------------ SSR-stabilné dátumy ------------ */
const TZ = 'Europe/Bratislava'
const dateFmt = new Intl.DateTimeFormat('sk-SK', {
  timeZone: TZ,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit'
})
function formatDateStable(val?: string | null) {
  if (!val) return '—'
  const d = new Date(val)
  if (Number.isNaN(+d)) return '—'
  return dateFmt.format(d)
}

/** ------------ state ------------ */
const query          = ref('')
const sortBy         = ref<Col>('status')
const sortDir        = ref<'asc' | 'desc'>('asc')
const selectedIds    = ref<string[]>([])

const statusFilters  = ref<Set<Status>>(new Set())
const lastRunFilters = ref<Set<LastRun>>(new Set())
const onlyQueueable  = ref(false)

/** ------------ derived ------------ */
const totalCount = computed(() => tasks.value.length)

/** ------------ filtering ------------ */
const baseList = computed<TaskRow[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return tasks.value
  return tasks.value.filter((t) => (t.type || '').toLowerCase().includes(q))
})

const counts = computed(() => {
  const s = { running: 0, queued: 0, idle: 0 } as Record<Status, number>
  const l = { success: 0, failed: 0, none: 0 } as Record<LastRun, number>
  for (const t of baseList.value) {
    const st = (t.status || 'idle') as Status
    const lr = (t.last_run_status ?? 'none') as LastRun
    s[st] = (s[st] ?? 0) + 1
    l[lr] = (l[lr] ?? 0) + 1
  }
  return { status: s, lastRun: l }
})

const filteredTasks = computed<TaskRow[]>(() => {
  let arr = [...baseList.value]
  if (statusFilters.value.size > 0) {
    arr = arr.filter((t) => statusFilters.value.has((t.status || 'idle') as Status))
  }
  if (lastRunFilters.value.size > 0) {
    arr = arr.filter((t) => lastRunFilters.value.has((t.last_run_status ?? 'none') as LastRun))
  }
  if (onlyQueueable.value) {
    arr = arr.filter((t) => canQueue(t))
  }
  return arr
})

/** ------------ sort ------------ */
const statusRank: Record<string, number> = { running: 0, queued: 1, idle: 2 }
const lastRunRank: Record<string, number> = { failed: 0, success: 1, none: 2 }

function compare(a: TaskRow, b: TaskRow, col: Col) {
  if (col === 'status') {
    return (statusRank[a.status || 'idle'] ?? 99) - (statusRank[b.status || 'idle'] ?? 99)
  }
  if (col === 'last_run_status') {
    const ka = a.last_run_status ?? 'none'
    const kb = b.last_run_status ?? 'none'
    return (lastRunRank[ka] ?? 99) - (lastRunRank[kb] ?? 99)
  }
  if (col === 'last_run_start' || col === 'last_run_end') {
    const ta = (a as any)[col] ? Date.parse((a as any)[col] as string) : Infinity
    const tb = (b as any)[col] ? Date.parse((b as any)[col] as string) : Infinity
    return ta - tb
  }
  if (col === 'run_count' || col === 'fail_count') {
    return ((a as any)[col] ?? 0) - ((b as any)[col] ?? 0)
  }
  // 'type'
  return ((a as any)[col] ?? '').toString().localeCompare(((b as any)[col] ?? '').toString())
}

const sortedTasks = computed<TaskRow[]>(() => {
  const arr = [...filteredTasks.value]
  arr.sort((a, b) => {
    const base = compare(a, b, sortBy.value)
    return sortDir.value === 'asc' ? base : -base
  })
  return arr
})

function toggleSort(col: Col) {
  if (sortBy.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortBy.value = col; sortDir.value = 'asc' }
}

/** ------------ queue logika (SSR safe) ------------ */
function canQueue(t: TaskRow) {
  if (t.status === 'queued' || t.status === 'running') return false
  if (!t.last_run_end) return true
  const mins = (Date.now() - new Date(t.last_run_end).getTime()) / 60000
  return mins >= 10
}

function queueTask(t: TaskRow) {
  if (!canQueue(t)) return
  // TODO: API call (POST)
  t.status = 'queued'
}

const allSelected = computed<boolean>(() => {
  if (!isClient) return false
  const eligible = sortedTasks.value.filter((t) => canQueue(t)).map((t) => t.type)
  return eligible.length > 0 && eligible.every(id => selectedIds.value.includes(id))
})

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (!checked) { selectedIds.value = []; return }
  selectedIds.value = sortedTasks.value.filter((t) => canQueue(t)).map((t) => t.type)
}

const canBatchQueue = computed(() => selectedIds.value.length > 0)

function batchQueue(): void {
  if (selectedIds.value.length === 0) return
  for (const t of sortedTasks.value) {
    if (selectedIds.value.includes(t.type) && canQueue(t)) {
      queueTask(t)
    }
  }
  selectedIds.value = []
}

/** ------------ filters toggles ------------ */
function toggleStatus(s: Status) {
  const set = new Set(statusFilters.value)
  set.has(s) ? set.delete(s) : set.add(s)
  statusFilters.value = set
}
function toggleLastRun(lr: LastRun) {
  const set = new Set(lastRunFilters.value)
  set.has(lr) ? set.delete(lr) : set.add(lr)
  lastRunFilters.value = set
}

const hasActiveFilters = computed(() =>
  !!query.value || statusFilters.value.size > 0 || lastRunFilters.value.size > 0 || onlyQueueable.value
)

function resetFilters() {
  query.value = ''
  statusFilters.value.clear()
  lastRunFilters.value.clear()
  onlyQueueable.value = false
}
</script>

<style scoped>
/* ---- (ponechané tvoje CSS) ---- */

/* Card wrapper */
.tasks-card { display:flex; flex-direction:column; gap:.5rem; flex:1 1 0; min-height:0; }
/* Toolbar */
.toolbar { display:flex; justify-content:space-between; align-items:center; gap:.75rem; padding:.25rem 0 .25rem; }
.toolbar, .filters { flex:0 0 auto; }
.left, .right { display:inline-flex; align-items:center; gap:.5rem; }
.count.muted { color:#64748b; font-size:.85rem; }

/* Search */
.search-wrap { display:inline-flex; align-items:center; gap:.35rem; border:1px solid var(--search-border-color); background:var(--sidebar-via); padding:0 .75rem; border-radius:.6rem; height:2rem; box-sizing:border-box; }
.search-input { border:none; outline:none; background:transparent; color:var(--search-text-color); min-width:280px; font-size:.9rem; }
.search-input::placeholder { color:#94a3b8; opacity:.8; }
.icon { width:.9rem; height:.9rem; }

.btn.clear-btn { padding:0; background:transparent; border:none; box-shadow:none; display:flex; align-items:center; justify-content:center; visibility:hidden; transition:visibility 0s, opacity .2s ease; opacity:0; }
.btn.clear-btn.is-visible { visibility:visible; opacity:1; cursor:pointer; }

/* Filters */
.filters { display:grid; grid-template-columns: .4fr 1fr auto; align-items:center; gap:.75rem; padding:.25rem .25rem .5rem; }
.filter-group { display:flex; align-items:center; gap:.5rem; }
.group-label { color:#475569; font-weight:700; font-size:.82rem; }

.segmented { display:inline-flex; gap:.35rem; flex-wrap:wrap; }
.seg-btn { display:inline-flex; align-items:center; gap:.4rem; padding:.35rem .55rem; border-radius:.5rem; border:1px solid #e2e8f0; background:#f8fafc; color:#334155; font-size:.78rem; font-weight:600; cursor:pointer; transition:all .15s ease; }
.seg-btn:hover { background:#eef2f7; }
.seg-btn.is-active { background:#e6f0ff; border-color:#bfdbfe; color:#1d4ed8; box-shadow:0 0 0 2px rgba(29,78,216,.08) inset; }
.seg-label { line-height:1; }
.seg-count { min-width:1.4em; padding:0 .35em; border-radius:.75rem; background:#e2e8f0; font-weight:700; font-size:.72rem; text-align:center; }
.seg-btn.is-active .seg-count { background:#bfdbfe; }

.filter-extras { display:inline-flex; align-items:center; gap:.5rem; justify-content:flex-end; }
.chk { display:inline-flex; align-items:center; gap:.4rem; font-size:.85rem; color:#334155; }

/* Buttons */
.btn { display:inline-flex; align-items:center; gap:.4rem; padding:.45rem .8rem; border-radius:.6rem; cursor:pointer; font-size:.82rem; font-weight:700; border:1px solid transparent; transition:all .2s ease; }
.btn:focus-visible { outline:2px solid #93c5fd; outline-offset:2px; }
.btn-icon { width:1rem; height:1rem; }
.btn-primary { background:#2563eb; color:#fff; border-color:#2563eb; }
.btn-primary:hover { background:#1d4ed8; transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,.2); }
.btn-secondary { background:#f1f5f9; color:#475569; border-color:#e2e8f0; }
.btn-secondary:hover { background:#e2e8f0; }
.btn-sm { padding:.28rem .5rem; font-size:.76rem; }
.btn:disabled { opacity:.55; cursor:not-allowed; }

/* Table container */
.table-wrap { flex:1 1 0; min-height:0; overflow:auto; max-height:none; border-radius:.6rem; background:#fff; }

/* Table */
.tasks-table { width:100%; border-collapse:separate; border-spacing:0; font-size:.7rem; }
.tasks-table thead th { position:sticky; top:0; z-index:1; background:#f1f5f9; color:#334155; font-weight:700; text-align:left; border-bottom:1px solid #e2e8f0; padding:.6rem .65rem; user-select:none; cursor:pointer; }
.tasks-table thead th.no-sort { cursor:default; }
.th-inner { display:inline-flex; align-items:center; gap:.35rem; }
.sort-icon .icon { width:.9rem; height:.9rem; }

.tasks-table tbody td { border-bottom:1px solid #eef2f7; padding:.55rem .65rem; color:#334155; }
.tasks-table tbody tr:nth-child(even) { background:#fbfdff; }
.tasks-table tbody tr:hover { background:#f5f8ff; }

.checkbox { width:36px; }

/* Numeric / mono */
.num { text-align:right; font-variant-numeric:tabular-nums; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }

/* Badges */
.badge { display:inline-block; padding:.22rem .5rem; border-radius:.25rem; font-weight:600; font-size:.72rem; text-transform:capitalize; line-height:1; }
.badge--running { background:rgba(34,197,94,.18); color:#15803d; border-color:rgba(34,197,94,.35); }
.badge--queued  { background:rgba(251,191,36,.20); color:#92400e; border-color:rgba(251,191,36,.40); }
.badge--idle    { background:rgba(148,163,184,.20); color:#475569; border-color:rgba(148,163,184,.35); }

.badge--lr-success { background:rgba(34,197,94,.18); color:#166534; border-color:rgba(34,197,94,.35); }
.badge--lr-failed  { background:rgba(239,68,68,.18); color:#991b1b; border-color:rgba(239,68,68,.35); }
.badge--lr-none    { background:rgba(148,163,184,.18); color:#475569; border-color:rgba(148,163,184,.35); }

/* Empty state */
.empty { text-align:center; color:#64748b; padding:1rem; }

/* Centrovanie tabule */
.tasks-table th, .tasks-table td { text-align:center; vertical-align:middle; }
.tasks-table thead th { text-align:center !important; }
.tasks-table thead th .th-inner { justify-content:center; }
.tasks-table .num { text-align:center; }

.tasks-table thead th { position:sticky; top:0; z-index:1; }
</style>
