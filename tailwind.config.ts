import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts}',
    './app/app.vue',
  ],
  theme: { extend: {} },
  plugins: []
} satisfies Config
