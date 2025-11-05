<!--app/components/Sidebar/SidebarFooter.vue-->
<template>
  <div class="sidebar-footer">
    <transition name="fade">
      <button v-if="!isCollapsed && showText" @click="$emit('toggle-pinned')" class="sidebar-footer-button" :title="pinned ? 'Unpin sidebar' : 'Pin sidebar'">
         <div class="sidebar-footer-icon-container">
            <component :is="pinned ? LockClosedIcon : LockOpenIcon" class="sidebar-footer-icon" />
        </div>
      </button>
    </transition>
    <transition name="fade">
      <button v-if="!isCollapsed && showText" @click="$emit('toggle-dark-mode')" class="sidebar-footer-button" :title="darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
        <div class="sidebar-footer-icon-container">
            <component :is="darkMode ? SunIcon : MoonIcon" class="sidebar-footer-icon" />
        </div>
      </button>
    </transition>
    <transition name="fade">
      <button v-if="!isCollapsed && showText" @click="$emit('logout')" class="sidebar-footer-button" title="Log out">
        <div class="sidebar-footer-icon-container">
            <ArrowRightOnRectangleIcon class="sidebar-footer-icon" />
        </div>
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {
  LockClosedIcon,
  LockOpenIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline';

defineProps<{
  isCollapsed: boolean;
  showText: boolean;
  pinned: boolean;
  darkMode: boolean;
}>();

defineEmits(['toggle-pinned', 'toggle-dark-mode', 'logout']);
</script>

<style scoped>
/* Päta sidebaru */
/* Päta sidebaru */
.sidebar-footer {
  height: 5rem;
  border-top: 1px solid var(--submenu-footer-border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  bottom: 0;
  flex-shrink: 0;
}

/* FIX: button má fixnú veľkosť, žiadny scale na ňom = bez posunu */
.sidebar-footer-button {
  width: 2.25rem;               /* fix šírka */
  height: 2.25rem;              /* fix výška */
  display: grid;                /* centrovanie obsahu */
  place-items: center;
  padding: 0;                   /* žiadny padding, nech sa nič nehýbe */
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--footer-button-color);
  cursor: pointer;
  transition: background-color 250ms ease, color 250ms ease;
  will-change: background-color, color;
}

/* Hover bez scale na tlačidle */
.sidebar-footer-button:hover {
  background-color: var(--footer-button-hover-bg);
  color: var(--footer-button-hover-color);
}

/* Kontajner ikony – fixný box, centrovanie */
.sidebar-footer-icon-container {
  width: 1.5rem;
  height: 1.5rem;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

/* FIX: scale iba na samotnej SVG ikone (žiadny reflow) */
.sidebar-footer-icon {
  width: 1.45rem;
  height: 1.45rem;
  transition: transform 200ms ease;   /* hladký scale */
  transform: translateZ(0);           /* anti-jitter hint */
}

.sidebar-footer-button:hover .sidebar-footer-icon {
  transform: scale(1.08); 
}

/* Animácie zostatok */
.fade-enter-active,
.fade-leave-active { transition: opacity 350ms ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.sidebar-footer-button:active .sidebar-footer-icon {
  transform: scale(0.98);
}

.sidebar-footer-button:hover .sidebar-footer-icon {
  transform: scale(1.12);
  color: var(--submenu-link-active-color);
}

.sidebar-footer-button:active .sidebar-footer-icon {
  transform: scale(0.95);
}


</style>