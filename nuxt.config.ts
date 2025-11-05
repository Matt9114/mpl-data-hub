import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  srcDir: 'app/',
  css: ['~/assets/main.css'],
  serverDir: 'app/server',
  ssr: true,
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vueuse/nuxt'],
  compatibilityDate: '2025-08-24',

  tailwindcss: {
    cssPath: '~/assets/main.css',
    configPath: 'tailwind.config.ts',
    viewer: false
  },

  // 👇 Auto-registrácia komponentov s prefixmi (vyhneš sa kolíziám)
  components: [
    { path: '~/shared/components', pathPrefix: false },
    // Data Flow Service – shared UI pre všetky domény (Dfs*)
    { path: '~/modules/tools/data-flow-service/shared/components', prefix: 'Dfs' },
    // Data Flow Service – EWM špecifické komponenty (Ewm*)
    { path: '~/modules/tools/data-flow-service/ewm/components', prefix: 'Ewm' }
    // Keď pridáš ďalší tool/doménu, pridáš ďalší riadok (napr. Apo*, Mes*, …)
  ],


    // 👇 Auto-import composables aj z modulov (globálne aj vnorené)
  imports: {
    dirs: [
      'composables',
      'shared/composables',
      'modules/**/composables',
      'modules/**/**/composables'
    ]
  },

  // 👇 Pinia nech prehľadá aj store-y vo vnútri modulov
  pinia: {
    storesDirs: [
      'stores',
      'shared/stores',
      'modules/**/stores',
      'modules/**/**/stores'
    ]
  },

  runtimeConfig: {
    // PRIVÁTNE (server)
    ewm: {
      baseURL: process.env.EWM_API_BASE || 'http://localhost:8000'
    },
    ewmUseMock: process.env.EWM_USE_MOCK === '1',
    ewmFallbackToMock: true,

    // VEREJNÉ (client)
    public: {
      tz: 'Europe/Bratislava',
      ewm: {
        baseURL: '/api/ewm'
      }
    }
  }
})
