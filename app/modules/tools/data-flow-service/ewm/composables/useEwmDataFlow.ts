import { ref, watch, onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * (Nepovinné) typovanie custom eventu pre krajšie DX.
 */
declare global {
  interface WindowEventMap {
    'dataflow:refresh': CustomEvent<void>
  }
}

/**
 * Modulové singletons – prežijú mount/unmount medzi route-mi.
 */
let _intervalId: ReturnType<typeof setInterval> | null = null
let _tickId: ReturnType<typeof setInterval> | null = null
let _refreshing = false
let _autoOn = false

export type UseEwmDataFlow = {
  isoLastRefresh: Ref<string>
  formattedLastRefresh: Ref<string>
  autoRefresh: Ref<boolean>
  nextIn: Ref<number>
  refreshEverySec: Ref<number>
  refreshData: () => Promise<void>
  toggleAutoRefresh: () => void
}

/**
 * Hlavný composable pre Data Flow header (timestamp, auto-refresh, countdown).
 * - interval sa perzistuje v localStorage (kľúč: dfs_refresh_sec)
 * - pri refreshi vyšle window event 'dataflow:refresh' (client-only)
 */
export function useEwmDataFlow(): UseEwmDataFlow {
  const isoLastRefresh = ref<string>('')
  const formattedLastRefresh = ref<string>('')

  // UI prepínač, zrkadlí modulový _autoOn
  const autoRefresh = ref<boolean>(_autoOn)

  // odpočet do najbližšieho refreshu (sekundy)
  const nextIn = ref<number>(0)

  // default interval (sekundy) – načítaj z localStorage ak je
  const refreshEverySec = ref<number>(10)
  if (process.client) {
    const stored = Number(localStorage.getItem('dfs_refresh_sec'))
    if (!Number.isNaN(stored) && stored > 0) {
      refreshEverySec.value = stored
    }
  }

  // perzistencia intervalu
  watch(
    refreshEverySec,
    (v) => {
      if (process.client) {
        localStorage.setItem('dfs_refresh_sec', String(v))
      }
    },
    { flush: 'post' }
  )

  function fmt(dt: Date) {
    return new Intl.DateTimeFormat('sk-SK', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(dt)
  }

  async function refreshData(): Promise<void> {
    if (_refreshing) return
    _refreshing = true
    try {
      // signal do ostatných častí dashboardu (client-only)
      if (process.client) {
        window.dispatchEvent(new CustomEvent('dataflow:refresh'))
      }

      // ⬇️ sem si doplň reálne fetchy (paralelne)
      // await Promise.all([ refreshTasks(), refreshWorkers(), refreshSessions() ])

      const now = new Date()
      isoLastRefresh.value = now.toISOString()
      formattedLastRefresh.value = fmt(now)

      // reset odpočtu len ak je auto ON
      if (_autoOn) nextIn.value = refreshEverySec.value
    } finally {
      _refreshing = false
    }
  }

  function stopTimers() {
    if (_intervalId) {
      clearInterval(_intervalId)
      _intervalId = null
    }
    if (_tickId) {
      clearInterval(_tickId)
      _tickId = null
    }
  }

  function startTimers() {
    stopTimers()

    // sekundový tick – znižuje countdown a spúšťa refresh pri nule
    _tickId = setInterval(() => {
      nextIn.value = Math.max(0, nextIn.value - 1)
      if (nextIn.value === 0 && _autoOn) {
        void refreshData() // reset sa udeje v refreshData()
      }
    }, 1000)

    // poistný interval – aj keby countdown nebežal
    _intervalId = setInterval(() => {
      if (_autoOn) void refreshData()
    }, refreshEverySec.value * 1000)

    nextIn.value = refreshEverySec.value
  }

  function toggleAutoRefresh() {
    _autoOn = !_autoOn
    autoRefresh.value = _autoOn
    if (_autoOn) startTimers()
    else stopTimers()
  }

  onMounted(() => {
    // inicializačný timestamp (aby UI nebolo prázdne)
    const now = new Date()
    isoLastRefresh.value = now.toISOString()
    formattedLastRefresh.value = fmt(now)

    // ak je auto ON, rozbehni timery po mountnutí
    if (_autoOn) startTimers()
  })

  onBeforeUnmount(() => {
    // ak je auto OFF, timery vypni; ak ON, nech bežia (singletons)
    if (!_autoOn) stopTimers()
  })

  // pri zmene intervalu reštartuj timery len pri auto ON
  watch(refreshEverySec, () => {
    if (_autoOn) startTimers()
    else nextIn.value = 0
  })

  return {
    isoLastRefresh,
    formattedLastRefresh,
    autoRefresh,
    nextIn,
    refreshEverySec,
    refreshData,
    toggleAutoRefresh
  }
}

/**
 * Alias pre spätnú kompatibilitu (niekde si volal useDataFlow)
 */
export const useDataFlow = useEwmDataFlow
