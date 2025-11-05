// app/lib/datetime.ts

type DateInput = string | number | Date | null | undefined

const FALLBACK = '—'

// vezme TZ z runtimeConfig (ak voláš mimo setupu, fallbackne na Europe/Bratislava)
function resolveTz(explicit?: string) {
  try {
    const cfg = useRuntimeConfig()
    return explicit || cfg.public?.tz || 'Europe/Bratislava'
  } catch {
    return explicit || 'Europe/Bratislava'
  }
}

export function toDate(input: DateInput): Date | null {
  if (input == null) return null
  if (input instanceof Date) return isNaN(+input) ? null : input
  if (typeof input === 'number') {
    const d = new Date(input)
    return isNaN(+d) ? null : d
  }
  // string
  const t = Date.parse(input as string)
  if (Number.isNaN(t)) return null
  return new Date(t)
}

/** Formát: dátum + čas (default), lokalizované SK, fixná TZ (SSR-safe) */
export function formatDate(
  input: DateInput,
  opts?: {
    dateStyle?: 'full' | 'long' | 'medium' | 'short'
    timeStyle?: 'full' | 'long' | 'medium' | 'short' | 'disabled'
    timeZone?: string
    fallback?: string
  }
): string {
  const d = toDate(input)
  if (!d) return opts?.fallback ?? FALLBACK
  const timeZone = resolveTz(opts?.timeZone)
  const { dateStyle = 'short', timeStyle = 'medium' } = opts || {}
  const base: Intl.DateTimeFormatOptions = { timeZone }
  if (dateStyle) (base as any).dateStyle = dateStyle
  if (timeStyle && timeStyle !== 'disabled') (base as any).timeStyle = timeStyle
  return new Intl.DateTimeFormat('sk-SK', base).format(d)
}

/** Len čas (bez dátumu) */
export function formatTime(input: DateInput, timeZone?: string, fallback = FALLBACK) {
  return formatDate(input, { dateStyle: 'disabled' as any, timeStyle: 'medium', timeZone, fallback })
}

/** ISO reťazec (ak chceš niečo ukladať/loggovať) */
export function toISO(input: DateInput): string | null {
  const d = toDate(input)
  return d ? d.toISOString() : null
}

/** Koľko sekúnd uplynulo od dátumu (∞ ak null/invalid) */
export function secondsSince(input: DateInput): number {
  const d = toDate(input)
  if (!d) return Number.POSITIVE_INFINITY
  return Math.max(0, Math.round((Date.now() - d.getTime()) / 1000))
}

/** Relatívny čas “pred 3 min” (SK), automatická jednotka */
export function formatSince(input: DateInput, timeZone?: string): string {
  const d = toDate(input)
  if (!d) return FALLBACK
  // pre konzistenciu s TZ prepočítaj difference voči lokálnemu času – na relatívny výpočet je to OK
  const diffMs = Date.now() - d.getTime()
  const rtf = new Intl.RelativeTimeFormat('sk-SK', { numeric: 'always' })

  const sec = Math.round(diffMs / 1000)
  const min = Math.round(sec / 60)
  const hrs = Math.round(min / 60)
  const days = Math.round(hrs / 24)

  if (Math.abs(sec) < 60) return rtf.format(-sec, 'second')     // “pred 5 s”
  if (Math.abs(min) < 60) return rtf.format(-min, 'minute')     // “pred 3 min”
  if (Math.abs(hrs) < 24) return rtf.format(-hrs, 'hour')       // “pred 2 h”
  return rtf.format(-days, 'day')                               // “pred 1 dňom”
}

/** Formát trvania z milisekúnd (clock = HH:MM:SS, short = 1h 3m 5s) */
export function formatDuration(ms: number, style: 'clock' | 'short' = 'short'): string {
  if (!Number.isFinite(ms) || ms < 0) return FALLBACK
  const totalSec = Math.floor(ms / 1000)
  const s = totalSec % 60
  const totalMin = Math.floor(totalSec / 60)
  const m = totalMin % 60
  const h = Math.floor(totalMin / 60)
  if (style === 'clock') {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }
  const parts = []
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  if (s || parts.length === 0) parts.push(`${s}s`)
  return parts.join(' ')
}

/** Pomocník: bezpečné triedenie podľa dátumu (null -> na koniec) */
export function compareDatesAsc(a: DateInput, b: DateInput): number {
  const da = toDate(a)?.getTime() ?? Infinity
  const db = toDate(b)?.getTime() ?? Infinity
  return da - db
}
