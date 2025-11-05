import type { NotifyLevel, NotifyOptions } from '~/types/notify'

export function useNotify() {
  const nuxtApp = useNuxtApp()

  const notify = (level: NotifyLevel, message: string, opts?: NotifyOptions) =>
    nuxtApp.$notify(level, message, opts)

  const notifyError = (err: unknown, fallback?: string) =>
    nuxtApp.$notifyError(err, fallback)

  return {
    notify,
    success: (m: string, o?: NotifyOptions) => notify('success', m, o),
    error:   (m: string, o?: NotifyOptions) => notify('error', m, o),
    info:    (m: string, o?: NotifyOptions) => notify('info', m, o),
    warning: (m: string, o?: NotifyOptions) => notify('warning', m, o),
    notifyError,
  }
}
