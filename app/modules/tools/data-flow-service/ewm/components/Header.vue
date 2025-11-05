<template>
  <div class="header-actions" role="toolbar" aria-label="Ovládanie panelu">
    <!-- Posledná obnova -->
    <div
      class="last-refresh muted"
      :title="`Posledná obnova: ${isoLastRefresh}`"
    >
      Posledná obnova: {{ formattedLastRefresh }}
    </div>

    <div class="separator" aria-hidden="true"></div>

    <div class="actions-group">
      <!-- Manuálne obnovenie -->
      <button
        class="btn btn-primary"
        @click="$emit('refresh')"
        title="Manuálne obnovenie"
      >
        <ArrowPathIcon class="btn-icon spin-once" aria-hidden="true" />
        Obnoviť
      </button>

      <!-- Auto refresh + nastavenia -->
      <div
        class="auto-refresh-group"
        @mouseleave="handleMouseLeave"
        @mouseenter="cancelClose"
      >
        <button
          class="btn btn-secondary"
          :class="{ active: autoRefresh }"
          @click="$emit('toggleAutoRefresh')"
          :aria-pressed="autoRefresh"
          :title="autoRefresh ? 'Automatické obnovovanie je ZAPNUTÉ' : 'Automatické obnovovanie je VYPNUTÉ'"
        >
          <ArrowsRightLeftIcon class="btn-icon" aria-hidden="true" />
          Auto
          <span class="countdown">({{ nextIn }}s)</span>
        </button>

        <button
          ref="settingsBtnRef"
          class="btn btn-settings"
          @click.stop="toggleSettings"
          title="Nastaviť interval"
          :aria-expanded="settingsOpen"
          aria-haspopup="menu"
          aria-controls="refresh-interval-menu"
        >
          <ChevronDownIcon
            class="settings-icon"
            :class="{ 'is-open': settingsOpen }"
            aria-hidden="true"
          />
        </button>

        <Transition name="fade">
          <div
            v-if="settingsOpen"
            id="refresh-interval-menu"
            class="settings-dropdown"
            v-on-click-outside="closeSettings"
            role="menu"
          >
            <div class="dropdown-title">Interval obnovenia</div>
            <ul>
              <li v-for="option in intervalOptions" :key="option.value" role="none">
                <button
                  role="menuitemradio"
                  :aria-checked="refreshEverySec === option.value"
                  @click="selectInterval(option.value)"
                  :class="{ active: refreshEverySec === option.value }"
                >
                  <span>{{ option.text }}</span>
                  <CheckIcon
                    v-if="refreshEverySec === option.value"
                    class="check-icon"
                    aria-hidden="true"
                  />
                </button>
              </li>
            </ul>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import { ArrowPathIcon, ArrowsRightLeftIcon, ChevronDownIcon, CheckIcon } from '@heroicons/vue/20/solid'

defineProps<{
  isoLastRefresh: string
  formattedLastRefresh: string
  autoRefresh: boolean
  nextIn: number
}>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'toggleAutoRefresh'): void
}>()

// v-model:refresh-every-sec
const refreshEverySec = defineModel<number>('refreshEverySec', { required: true })

// State
const settingsOpen = ref(false)
const settingsBtnRef = ref<HTMLButtonElement | null>(null)

const intervalOptions = [
  { value: 5, text: '5 sekúnd' },
  { value: 10, text: '10 sekúnd' },
  { value: 30, text: '30 sekúnd' },
  { value: 60, text: '1 minúta' },
] as const

function selectInterval(value: number) {
  refreshEverySec.value = value
  closeSettings()
}

function toggleSettings() {
  settingsOpen.value = !settingsOpen.value
  if (settingsOpen.value) {
    nextTick(() => settingsBtnRef.value?.focus())
  }
}

function closeSettings() {
  settingsOpen.value = false
  settingsBtnRef.value?.focus()
}

let closeTimeout: ReturnType<typeof setTimeout> | null = null
function handleMouseLeave() {
  closeTimeout = setTimeout(() => {
    closeSettings()
    closeTimeout = null
  }, 300)
}
function cancelClose() {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
}
</script>

<style scoped>
.header-actions { display: flex; align-items: center; gap: 1rem; width: 100%; flex-wrap: wrap; }
.separator { flex-grow: 1; }

.last-refresh {
  font-size: 0.82rem;
  color: #64748b;
  white-space: nowrap;
}

.actions-group { display: flex; align-items: center; gap: 0.5rem; }

/* Buttons */
.btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.8rem; border-radius: 0.6rem; cursor: pointer; font-size: 0.82rem; font-weight: 600; border: 1px solid transparent; transition: all 0.2s ease; }
.btn:focus-visible { outline: 2px solid #93c5fd; outline-offset: 2px; }
.btn-icon { width: 1rem; height: 1rem; }

.btn-primary { background-color: #2563eb; color: #fff; border-color: #2563eb; }
.btn-primary:hover { background-color: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.btn-primary .spin-once:active { animation: spin 0.6s linear 1; }
@keyframes spin { to { transform: rotate(360deg); } }

.btn-secondary { background-color: #f1f5f9; color: #475569; border-color: #e2e8f0; border-right: none; border-top-right-radius: 0; border-bottom-right-radius: 0; }
.btn-secondary:hover { background-color: #e2e8f0; }
.btn-secondary.active { background-color: #dcfce7; color: #166534; border-color: #86efac; }
.countdown { font-variant-numeric: tabular-nums; font-weight: 700; }

.btn-settings { background-color: #f1f5f9; color: #475569; border-color: #e2e8f0; padding: 0.45rem 0.4rem; border-top-left-radius: 0; border-bottom-left-radius: 0; }
.btn-settings:hover { background-color: #e2e8f0; }
.settings-icon { width: 1rem; height: 1rem; transition: transform 0.2s ease; }
.settings-icon.is-open { transform: rotate(180deg); }

/* Dropdown */
.auto-refresh-group { position: relative; display: flex; }
.settings-dropdown { position: absolute; top: calc(100% + 0.5rem); right: 0; width: 180px; background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.5rem; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); z-index: 10; margin-top: 3px; }
.dropdown-title { padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
.settings-dropdown ul { list-style: none; margin: 0; padding: 0; }
.settings-dropdown li button { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: none; border: none; cursor: pointer; text-align: left; font-size: 0.85rem; font-weight: 500; color: #334155; transition: background-color 0.2s ease; }
.settings-dropdown li button:hover { background-color: #f1f5f9; }
.settings-dropdown li button.active { color: #2563eb; font-weight: 700; background-color: #eff6ff; }
.check-icon { width: 1rem; height: 1rem; color: #2563eb; }

/* Animácia */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
