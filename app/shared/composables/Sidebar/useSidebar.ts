// composables/useSidebar.ts
import { ref, watch, onMounted, nextTick } from 'vue'

const TRANSITION_MS = 350 // zlaď s CSS trvaním na sidebare
let resizeTimer: number | null = null

function fireStableResize() {
  // dvojitý rAF = poctivo po layoute
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
    })
  })
}

function scheduleResizeAfterTransition() {
  if (resizeTimer) clearTimeout(resizeTimer)
  // + ~1 frame navyše kvôli vyhladeniu
  resizeTimer = window.setTimeout(fireStableResize, TRANSITION_MS + 20)
}

export function useSidebar() {
  const isCollapsed = ref(true)
  const pinned = ref(false)
  const showText = ref(false)

  onMounted(() => {
    const storedPinned = localStorage.getItem('sidebarPinned')
    if (storedPinned) pinned.value = storedPinned === 'true'

    const storedCollapsed = localStorage.getItem('sidebarCollapsed')
    if (storedCollapsed !== null) {
      isCollapsed.value = storedCollapsed === 'true' && !pinned.value
    } else {
      isCollapsed.value = !pinned.value
    }
    showText.value = !isCollapsed.value

    // po inicializácii (keď sa šírka nastaví podľa storage) sendni 1x resize
    scheduleResizeAfterTransition()
  })

  watch(pinned, (val) => {
    localStorage.setItem('sidebarPinned', String(val))
    if (val) isCollapsed.value = false
    scheduleResizeAfterTransition()
  })

  watch(isCollapsed, (val) => {
    localStorage.setItem('sidebarCollapsed', String(val))
    // keď sa zmení collapsed, prebehne CSS transition → po nej pošleme resize
    scheduleResizeAfterTransition()
  })

  function togglePinned() {
    pinned.value = !pinned.value
  }

  function onMouseEnter() {
    if (!pinned.value) {
      isCollapsed.value = false
      scheduleResizeAfterTransition()
    }
  }

  function onMouseLeave() {
    if (!pinned.value) {
      isCollapsed.value = true
      scheduleResizeAfterTransition()
    }
  }

  async function onTransitionEnd(e: TransitionEvent) {
    // podľa toho, čo animuješ: width alebo transform
    if (e.propertyName === 'width' || e.propertyName === 'transform') {
      showText.value = !isCollapsed.value
      await nextTick() // nech DOM dobehne na finálnu šírku
      fireStableResize()
      // voliteľne: custom event ak by si to chcel inde počúvať
      window.dispatchEvent(
        new CustomEvent('sidebar:transition-end', {
          detail: { collapsed: isCollapsed.value, pinned: pinned.value }
        })
      )
    }
  }

  return {
    isCollapsed,
    pinned,
    showText,
    togglePinned,
    onMouseEnter,
    onMouseLeave,
    onTransitionEnd,
  }
}
