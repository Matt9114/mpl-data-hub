<!-- components/DataFlowService/MainNav.vue -->
<template>
  <div class="main-nav-wrapper">
    <!-- Tabs -->
    <nav class="main-nav" role="navigation" aria-label="Sekcie dashboardu">
      <ul>
        <li
          v-for="item in navItems"
          :key="item.key"
          :class="{ active: current === item.key }"
        >
          <button
            type="button"
            class="nav-btn"
            @click="setSelected(item.key)"
            :aria-current="current === item.key ? 'page' : undefined"
          >
            <component
              v-if="item.icon"
              :is="item.icon"
              class="icon"
              aria-hidden="true"
            />
            <span class="label">{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Tab content -->
    <div class="tab-content">
      <keep-alive>
        <component :is="tabComponents[current]" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type Component as VueComponent } from 'vue'

/* Views */
import OverallView from './Overall/OverallView.vue'
import SessionsView from './Sessions/SessionsView.vue'
import WorkersView  from './Workers/WorkersView.vue'
import TasksView    from './Tasks/TasksView.vue'

/* Icons */
import {
  HomeIcon,
  ClockIcon,
  UserGroupIcon,
  QueueListIcon
} from '@heroicons/vue/20/solid'

defineOptions({ name: 'MainNav' })

type TabKey = 'overall' | 'sessions' | 'workers' | 'tasks'
type NavItem = {
  key: TabKey
  label: string
  icon: VueComponent
}

/* Config */
const STORAGE_KEY = 'dfs_current_tab'

const navItems: readonly NavItem[] = [
  { key: 'overall',  label: 'Overall',  icon: HomeIcon },
  { key: 'sessions', label: 'Sessions', icon: ClockIcon },
  { key: 'workers',  label: 'Workers',  icon: UserGroupIcon },
  { key: 'tasks',    label: 'Tasks',    icon: QueueListIcon }
] as const

const tabComponents: Record<TabKey, VueComponent> = {
  overall:  OverallView,
  sessions: SessionsView,
  workers:  WorkersView,
  tasks:    TasksView
}

/* State */
const current = ref<TabKey>('overall')

function setSelected(key: TabKey) {
  current.value = key
}

/* Persist poslednej tabu */
onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as TabKey | null
    if (saved && saved in tabComponents) current.value = saved
  } catch { /* ignore */ }
})

watch(current, (val) => {
  try { localStorage.setItem(STORAGE_KEY, val) } catch { /* ignore */ }
})
</script>

<style scoped>
/* Wrapper drží plnú výšku a nechá obsah skrolovať správne */
.main-nav-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 0; /* kľúčové pre vnútorný scroll */
  height: 100%;
}

/* Top tabs */
.main-nav {
  display: flex;
  border-bottom: 1px solid var(--sidebar-border-color, #e2e8f0);
  margin-bottom: 0.75rem;
  flex: 0 0 auto; /* fixná výška */
}
.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  gap: .25rem;
  width: 100%;
}
.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: 0.5rem 0.9rem;
  cursor: pointer;
  font-weight: 600;
  font-size: .9rem;
  color: var(--submenu-link-text, #64748b);
  background: transparent;
  border: 1px solid transparent;
  border-bottom: 2px solid transparent;
  border-radius: .5rem .5rem 0 0;
  transition: color .18s ease, background-color .18s ease, border-color .18s ease, transform .1s ease;
}
.nav-btn:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}
.main-nav li.active .nav-btn {
  color: var(--submenu-link-active-color, #2563eb);
  border-bottom-color: var(--submenu-link-active-color, #2563eb);
}
.icon { width: 1rem; height: 1rem; }

/* Content area: vyplní zvyšok výšky a nechá dieťa skrolovať */
.tab-content {
  flex: 1 1 0;
  min-height: 0;  /* dôležité */
  display: flex;  /* aby dieťa mohlo mať flex:1 */
}
.tab-content > * {
  flex: 1 1 0;
  min-height: 0;  /* dôležité pre vnútorný overflow (napr. tabuľka) */
}
</style>
