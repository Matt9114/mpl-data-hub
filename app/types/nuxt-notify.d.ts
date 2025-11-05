// app/types/nuxt-notify.d.ts
import type { NotifyLevel, NotifyOptions } from '~/types/notify'

declare module '#app' {
  interface NuxtApp {
    $notify: (level: NotifyLevel, message: string, opts?: NotifyOptions) => unknown
    $notifyError: (err: unknown, fallback?: string) => void
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $notify: (level: NotifyLevel, message: string, opts?: NotifyOptions) => unknown
    $notifyError: (err: unknown, fallback?: string) => void
  }
}

export {}
