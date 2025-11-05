// types/nuxt.d.ts
import 'nuxt/schema'

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    ewm: { baseURL: string }
  }
  interface PublicRuntimeConfig {
    tz: string
    ewm: { baseURL: string }
  }
}

export {}
