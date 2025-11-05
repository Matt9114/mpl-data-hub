<!-- app/components/DataFlowService/Sessions/SessionsView.vue -->
<template>
  <section class="sessions-card">
    <!-- CONTROLS ROW -->
    <div class="controls-row">
      <!-- 1) SEARCH + Reset -->
      <div class="col search-col">
        <div class="search-wrap">
          <MagnifyingGlassIcon class="icon" aria-hidden="true" />
          <input
            v-model="query"
            type="text"
            class="search-input"
            placeholder="Hľadať podľa session ID…"
            aria-label="Hľadať session"
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

        <button
          class="btn btn-link"
          :disabled="!hasActiveFilters"
          @click="resetFilters"
          title="Vyčistiť filtre"
        >
          <ArrowPathIcon class="btn-icon" aria-hidden="true" />
          <span>Reset filtrov</span>
        </button>
      </div>

      <!-- 2) FILTERS — rádia -->
      <div class="col filters-col">
        <!-- GUI -->
        <fieldset class="radio-group" aria-label="GUI filter">
          <span class="group-label">GUI</span>

          <label class="chk">
            <input type="radio" value="all" v-model="guiRadio" />
            <span>All</span>
          </label>
          <label class="chk">
            <input type="radio" value="open" v-model="guiRadio" />
            <span>Open</span>
          </label>
          <label class="chk">
            <input type="radio" value="closed" v-model="guiRadio" />
            <span>Closed</span>
          </label>
        </fieldset>

        <div class="divider"></div>

        <!-- STATUS -->
        <fieldset class="radio-group" aria-label="Status filter">
          <span class="group-label">Status</span>

          <label class="chk"><input type="radio" value="all" v-model="statusRadio" /><span>All</span></label>
          <label class="chk"><input type="radio" value="idle" v-model="statusRadio" /><span>Idle</span></label>
          <label class="chk"><input type="radio" value="busy" v-model="statusRadio" /><span>Busy</span></label>
          <label class="chk"><input type="radio" value="error" v-model="statusRadio" /><span>Error</span></label>
          <label class="chk"><input type="radio" value="stopped" v-model="statusRadio" /><span>Stopped</span></label>
        </fieldset>
      </div>

      <!-- 3) ACTIONS – vpravo -->
      <div class="col actions-col">
        <div class="end-actions">
          <button
            class="btn btn-tonal"
            :disabled="!canCloseBatch"
            @click="batchClose"
            title="Zavrieť vybrané"
          >
            <SquaresPlusIcon class="btn-icon" aria-hidden="true" />
            <span>Close vybrané</span>
          </button>

          <button
            class="btn btn-primary"
            :disabled="!canStartBatch"
            @click="batchStart"
            title="Spustiť vybrané"
          >
            <ArrowTopRightOnSquareIcon class="btn-icon" aria-hidden="true" />
            <span>Start vybrané</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-wrap">
      <table class="sessions-table">
        <thead>
          <tr>
            <th class="checkbox">
              <input
                type="checkbox"
                :checked="isClient && allSelected"
                :disabled="!isClient || filteredSessions.length === 0"
                @change="toggleSelectAll"
                aria-label="Vybrať všetko"
              />
            </th>
            <th @click="toggleSort('string_id')">
              <span class="th-inner">
                <span>Session ID</span>
                <span v-if="sortBy==='string_id'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>
            <th @click="toggleSort('session_module')">
              <span class="th-inner">
                <span>Module</span>
                <span v-if="sortBy==='session_module'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>
            <th @click="toggleSort('gui_status')">
              <span class="th-inner">
                <span>GUI</span>
                <span v-if="sortBy==='gui_status'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>
            <th @click="toggleSort('session_status')">
              <span class="th-inner">
                <span>Status</span>
                <span v-if="sortBy==='session_status'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>
            <th @click="toggleSort('allocated_to_worker')">
              <span class="th-inner">
                <span>Worker</span>
                <span v-if="sortBy==='allocated_to_worker'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>
            <th @click="toggleSort('created_at')">
              <span class="th-inner">
                <span>Created</span>
                <span v-if="sortBy==='created_at'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>
            <th @click="toggleSort('last_usage')">
              <span class="th-inner">
                <span>Last Usage</span>
                <span v-if="sortBy==='last_usage'" class="sort-icon">
                  <ChevronUpIcon v-if="sortDir==='asc'" class="icon" />
                  <ChevronDownIcon v-else class="icon" />
                </span>
              </span>
            </th>
            <th class="no-sort">Akcie</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sortedSessions" :key="s.id">
            <td class="checkbox">
              <input
                type="checkbox"
                :value="s.id"
                v-model="selectedIds"
                :aria-label="`Vybrať ${s.string_id}`"
              />
            </td>
            <td class="mono">{{ s.string_id }}</td>
            <td>{{ s.session_module }}</td>
            <td>
              <span class="badge" :class="`badge--gui-${(s.gui_status || 'unknown').toLowerCase()}`">
                {{ s.gui_status || 'unknown' }}
              </span>
            </td>
            <td>
              <span class="badge" :class="`badge--st-${(s.session_status || 'unknown').toLowerCase()}`">
                {{ s.session_status || 'unknown' }}
              </span>
            </td>
            <td class="num">{{ s.allocated_to_worker ?? '—' }}</td>
            <td class="mono">{{ formatDate(s.created_at) }}</td>
            <td class="mono">{{ formatDate(s.last_usage) }}</td>
            <td class="actions-cell">
              <button
                v-if="canClose(s)"
                class="btn btn-primary btn-sm"
                @click="closeSession(s)"
                title="Zavrieť GUI"
              >
                <XCircleIcon class="btn-icon" aria-hidden="true" />
                Close
              </button>
              <button
                v-if="canOpen(s)"
                class="btn btn-secondary btn-sm"
                @click="openSession(s)"
                title="Otvoriť GUI"
              >
                <ArrowTopRightOnSquareIcon class="btn-icon" aria-hidden="true" />
                Open
              </button>
            </td>
          </tr>
          <tr v-if="!loading && sortedSessions.length === 0">
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
  ArrowTopRightOnSquareIcon, XCircleIcon, ArrowPathIcon
} from '@heroicons/vue/20/solid'

// composable (explicitný import, aby sa neprešmykol auto-import)


// --- typ lokálne, aby nemusel existovať externý .d.ts
type Session = {
  id: number
  string_id: string
  session_module?: string | null
  gui_status?: 'open' | 'closed' | null
  session_status?: 'idle' | 'busy' | 'error' | 'stopped' | null
  allocated_to_worker?: number | null
  created_at?: string | null
  last_usage?: string | null
}

type Col =
  | 'string_id' | 'session_module'
  | 'gui_status' | 'session_status'
  | 'allocated_to_worker' | 'created_at' | 'last_usage'

const ALL_GUI = ['open', 'closed'] as const
type Gui = typeof ALL_GUI[number]
const ALL_ST = ['idle', 'busy', 'error', 'stopped'] as const
type St = typeof ALL_ST[number]

type GuiRadio = Gui | 'all'
type StRadio  = St  | 'all'

const GUI_LABELS: Record<Gui | 'all', string> = { all: 'All', open: 'Open', closed: 'Closed' }
const STATUS_LABELS: Record<St | 'all', string> = { all: 'All', idle: 'Idle', busy: 'Busy', error: 'Error', stopped: 'Stopped' }

const { sessions, loading, formatDate } = useSessionsEwm()

/* Stav */
const query = ref('')
const sortBy  = ref<Col>('session_status')
const sortDir = ref<'asc'|'desc'>('asc')
const selectedIds = ref<number[]>([])

const guiRadio    = ref<GuiRadio>('all')
const statusRadio = ref<StRadio>('all')

/* Filtrovanie */
const baseList = computed<Session[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return sessions.value as Session[]
  return (sessions.value as Session[]).filter(s =>
    s.string_id.toLowerCase().includes(q) ||
    (s.allocated_to_worker !== null && s.allocated_to_worker !== undefined && String(s.allocated_to_worker).includes(q))
  )
})

const filteredSessions = computed<Session[]>(() => {
  let arr = [...baseList.value]
  if (guiRadio.value !== 'all') {
    arr = arr.filter(s => (String(s.gui_status ?? 'open').toLowerCase() as Gui) === guiRadio.value)
  }
  if (statusRadio.value !== 'all') {
    arr = arr.filter(s => (String(s.session_status ?? 'idle').toLowerCase() as St) === statusRadio.value)
  }
  return arr
})

/* Triedenie */
const guiRank: Record<string, number> = { open: 0, closed: 1 }
const stRank:  Record<string, number> = { busy: 0, idle: 1, error: 2, stopped: 3 }

function compare(a: Session, b: Session, col: Col) {
  if (col === 'gui_status') {
    return (guiRank[(a.gui_status || 'open').toLowerCase()] ?? 99)
         - (guiRank[(b.gui_status || 'open').toLowerCase()] ?? 99)
  }
  if (col === 'session_status') {
    return (stRank[(a.session_status || 'idle').toLowerCase()] ?? 99)
         - (stRank[(b.session_status || 'idle').toLowerCase()] ?? 99)
  }
  if (col === 'allocated_to_worker') {
    const av = a.allocated_to_worker ?? Infinity
    const bv = b.allocated_to_worker ?? Infinity
    return av - bv
  }
  if (col === 'created_at' || col === 'last_usage') {
    const ta = a[col] ? Date.parse(a[col] as string) : Infinity
    const tb = b[col] ? Date.parse(b[col] as string) : Infinity
    return ta - tb
  }
  return (a[col] ?? '').toString().localeCompare((b[col] ?? '').toString())
}

const sortedSessions = computed<Session[]>(() => {
  const arr = [...filteredSessions.value]
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

/* Akcie */
function canClose(s: Session) { return (s.gui_status || 'open').toLowerCase() === 'open' }
function closeSession(s: Session) { if (canClose(s)) s.gui_status = 'closed' }
function canOpen(s: Session) { return (s.gui_status || 'open').toLowerCase() === 'closed' }
function openSession(s: Session) { if (canOpen(s)) s.gui_status = 'open' }

/* Výber / batch */
const allSelected = computed(() => {
  if (!isClient) return false
  const visible = sortedSessions.value.map(s => s.id)
  return visible.length > 0 && visible.every(id => selectedIds.value.includes(id))
})

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (!checked) { selectedIds.value = []; return }
  selectedIds.value = sortedSessions.value.map(s => s.id)
}

const canCloseBatch = computed(() =>
  selectedIds.value.some(id => {
    const s = sortedSessions.value.find(x => x.id === id)
    return s ? canClose(s) : false
  })
)
const canStartBatch = computed(() =>
  selectedIds.value.some(id => {
    const s = sortedSessions.value.find(x => x.id === id)
    return s ? canOpen(s) : false
  })
)

function batchClose() {
  for (const id of selectedIds.value) {
    const s = sortedSessions.value.find(x => x.id === id)
    if (s && canClose(s)) closeSession(s)
  }
  selectedIds.value = []
}
function batchStart() {
  for (const id of selectedIds.value) {
    const s = sortedSessions.value.find(x => x.id === id)
    if (s && canOpen(s)) openSession(s)
  }
  selectedIds.value = []
}

const hasActiveFilters = computed(() =>
  !!query.value || guiRadio.value !== 'all' || statusRadio.value !== 'all'
)
function resetFilters() {
  query.value = ''
  guiRadio.value = 'all'
  statusRadio.value = 'all'
}
</script>

<style scoped>
/* layout */
.sessions-card{ display:flex; flex-direction:column; gap:.5rem; flex:1 1 0; min-height:0; }

.search-wrap{
  display:inline-flex; align-items:center; gap:.35rem;
  border:1px solid var(--search-border-color);
  background:var(--sidebar-via);
  padding:0 .75rem; border-radius:.6rem;
  height:2rem; box-sizing:border-box;
}
.search-input{ border:none; outline:none; background:transparent; color:var(--search-text-color); min-width:280px; font-size:.9rem; }
.search-input::placeholder{ color:var(--placeholder-color); opacity:.8; }
.icon{ width:.9rem; height:.9rem; }

.btn.clear-btn{
  padding:0; background:transparent; border:none; box-shadow:none;
  display:flex; align-items:center; justify-content:center;
  visibility:hidden; opacity:0; transition:visibility 0s, opacity .2s;
}
.btn.clear-btn.is-visible{ visibility:visible; opacity:1; cursor:pointer; }

/* table */
.table-wrap{ flex:1 1 0; min-height:0; overflow:auto; border:1px solid var(--search-border-color); border-radius:.6rem; background:#fff; }
.sessions-table{ width:100%; border-collapse:separate; border-spacing:0; font-size:.7rem; }
.sessions-table thead th{
  position:sticky; top:0; z-index:1; background:#f1f5f9; color:#334155; font-weight:700;
  border-bottom:1px solid #e2e8f0; padding:.6rem .65rem; user-select:none; cursor:pointer; text-align:center;
}
.sessions-table thead th.no-sort{ cursor:default; }
.th-inner{ display:inline-flex; align-items:center; gap:.35rem; justify-content:center; }
.sort-icon .icon{ width:.9rem; height:.9rem; }
.sessions-table tbody td{ border-bottom:1px solid #eef2f7; padding:.55rem .65rem; color:#334155; text-align:center; vertical-align:middle; }
.sessions-table tbody tr:nth-child(even){ background:#fbfdff; }
.sessions-table tbody tr:hover{ background:#f5f8ff; }
.checkbox{ width:36px; }
.num{ text-align:center; font-variant-numeric:tabular-nums; }
.mono{ font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }

.badge{ display:inline-block; padding:.22rem .5rem; border-radius:.25rem; font-weight:600; font-size:.72rem; text-transform:capitalize; line-height:1; }
.badge--gui-open{ background:rgba(34,197,94,.18); color:#166534; }
.badge--gui-closed{ background:rgba(148,163,184,.20); color:#475569; }
.badge--st-idle{ background:rgba(148,163,184,.18); color:#475569; }
.badge--st-busy{ background:rgba(251,191,36,.20); color:#92400e; }
.badge--st-error{ background:rgba(239,68,68,.18); color:#991b1b; }
.badge--st-stopped{ background:rgba(148,163,184,.20); color:#475569; }

/* controls row */
.controls-row{
  display:flex; align-items:center; gap:.75rem; padding:.25rem 0 .5rem;
  flex-wrap:nowrap; white-space:nowrap; overflow-x:auto; -webkit-overflow-scrolling:touch;
}
.controls-row .col{ display:inline-flex; align-items:center; gap:.75rem; flex:0 0 auto; }
.search-col{ min-width:300px; }
.filters-col{ flex:1 1 auto; justify-content:center; min-width:420px; }
.filters-col .radio-group{ display:inline-flex; align-items:center; gap:.5rem; margin:0; padding:0; border:0; }
.filters-col .divider{ width:1px; height:22px; background:#e2e8f0; margin:0 .5rem; }
.group-label{ color:#475569; font-weight:700; font-size:.82rem; }
.chk{ display:inline-flex; align-items:center; gap:.35rem; font-size:.85rem; color:#334155; }

.actions-col{ margin-left:auto; display:inline-flex; align-items:center; gap:.5rem; }
.end-actions{ display:inline-flex; align-items:center; gap:.5rem; }

/* buttons */
.btn{
  display:inline-flex; align-items:center; gap:.4rem; padding:.45rem .8rem; border-radius:.6rem; cursor:pointer;
  font-size:.82rem; font-weight:700; border:1px solid transparent; transition:all .2s ease; white-space:nowrap;
}
.btn:focus-visible{ outline:2px solid #93c5fd; outline-offset:2px; }
.btn-icon{ width:1rem; height:1rem; }
.btn-primary{ background:#2563eb; color:#fff; border-color:#2563eb; }
.btn-primary:hover{ background:#1d4ed8; transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,.2); }
.btn-tonal{ background:#e8f0ff; color:#1d4ed8; border-color:#bfdbfe; }
.btn-tonal:hover{ background:#dbeafe; transform:translateY(-1px); box-shadow:0 4px 12px rgba(29,78,216,.15); }
.btn-link{ background:transparent; color:#334155; border-color:transparent; }
.btn-link:hover{ background:#f1f5f9; }
</style>
