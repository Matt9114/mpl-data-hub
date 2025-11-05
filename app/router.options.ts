// app/router.options.ts
import type { RouterConfig } from '@nuxt/schema'
import type { RouterScrollBehavior } from 'vue-router'

const scrollBehavior: RouterScrollBehavior = (to, _from, saved) => {
  // SSR-safe
  if (process.server) return

  const main = document.querySelector<HTMLElement>('main.main-area')
  if (!main) return

  // 1) uložená pozícia (späť/vpred)
  if (saved) {
    main.scrollTo({
      left: saved.left ?? 0,
      top: saved.top ?? 0,
      behavior: 'auto'
    })
    return
  }

  // 2) hash (#anchor)
  if (to.hash) {
    const sel = (window.CSS && CSS.escape)
      ? `#${CSS.escape(to.hash.slice(1))}`
      : to.hash

    const target =
      main.querySelector<HTMLElement>(sel) ||
      document.querySelector<HTMLElement>(sel)

    if (target) {
      if (main.contains(target)) {
        const mainRect = main.getBoundingClientRect()
        const rect = target.getBoundingClientRect()
        const top = rect.top - mainRect.top + main.scrollTop
        main.scrollTo({ top, behavior: 'smooth' })
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }
  }

  // 3) default – hore
  main.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

export default <RouterConfig>{
  scrollBehavior
}
