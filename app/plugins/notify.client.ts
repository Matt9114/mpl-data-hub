// app/plugins/notify.client.ts
import { defineNuxtPlugin } from '#app'
import Toast, { POSITION, TYPE, useToast } from 'vue-toastification'
import type { NotifyLevel, NotifyOptions } from '~/types/notify'

// POZN: CSS štýly toastov importuj v app/app.vue (ako sme nastavili)

export default defineNuxtPlugin((nuxtApp) => {
  // 1) Nainštaluj plugin (raz)
  nuxtApp.vueApp.use(Toast, {
    position: POSITION.TOP_RIGHT,
    timeout: 3500,
    closeOnClick: true
  })

  // 2) Získaj inštanciu
  const toast = useToast()

  // 3) API
  const notify = (
    level: NotifyLevel,
    message: string,
    opts: NotifyOptions = {}
  ) => {
    const { title, timeout = 2500, closeOnClick = true } = opts
    const text = title ? `${title}\n${message}` : message
    const common = { timeout, closeOnClick }

    switch (level) {
      case 'success': return toast.success(text, { ...common, type: TYPE.SUCCESS })
      case 'error':   return toast.error(text,   { ...common, type: TYPE.ERROR })
      case 'warning': return toast.warning(text, { ...common, type: TYPE.WARNING })
      default:        return toast.info(text,    { ...common, type: TYPE.INFO })
    }
  }

  const notifyFromError = (err: unknown, fallback = 'Nastala neočakávaná chyba.') => {
    try {
      const anyErr: any = err
      const msg = anyErr?.data?.message || anyErr?.message || fallback
      notify('error', msg, { timeout: 5000 })
    } catch {
      notify('error', fallback, { timeout: 5000 })
    }
  }

  // 4) Provide
  return {
    provide: {
      notify,
      notifyError: notifyFromError,
    }
  }
})
