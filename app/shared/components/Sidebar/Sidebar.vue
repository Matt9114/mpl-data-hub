<!--app/components/Sidebar/Sidebar.vue-->
<template>
  <aside
    class="sidebar"
    :class="isCollapsed ? 'sidebar--collapsed' : 'sidebar--expanded'"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @transitionend="onTransitionEnd"
  >
    <SidebarHeader :is-collapsed="isCollapsed" :show-text="showText" />

    <div class="sidebar-content">
      <SidebarSearch
        v-model="searchQuery"
        :is-collapsed="isCollapsed"
        :show-text="showText"
      />
      <SidebarNav
        :menu="filteredMenu"
        :is-collapsed="isCollapsed"
        :show-text="showText"
        :final-expanded-groups="finalExpandedGroups"
        :final-expanded-menu="finalExpandedMenu"
        @toggle-group="toggleGroup"
        @toggle-submenu="toggleSubmenu"
      />
    </div>

    <!-- VYLEPŠENÉ: Props a eventy sú teraz napojené na nový `useTheme` composable -->
    <SidebarFooter
      :is-collapsed="isCollapsed"
      :show-text="showText"
      :pinned="pinned"
      :dark-mode="theme === 'dark'"
      @toggle-pinned="togglePinned"
      @toggle-dark-mode="toggleTheme"
      @logout="handleLogout"
    />
  </aside>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification';
import { navigateTo } from 'nuxt/app';
import { useAuthStore } from '~/shared/stores/authStore';

// Importy našich composables
import { useSidebar } from '~/shared/composables/Sidebar/useSidebar';
import { useMenuFilter } from '~/shared/composables/Sidebar/useMenuFilter';
import { useRoleFilteredMenu } from '~/shared/composables/Sidebar/useRoleFilteredMenu';
import { useTheme } from '~/shared/composables/useTheme';

// Importy častí sidebaru
import SidebarHeader from './SidebarHeader.vue';
import SidebarSearch from './SidebarSearch.vue';
import SidebarFooter from './SidebarFooter.vue';
import SidebarNav from './SidebarNav.vue';


const { 
  isCollapsed, pinned, showText, togglePinned, 
  onMouseEnter, onMouseLeave, onTransitionEnd 
} = useSidebar();

const { theme, toggleTheme } = useTheme();
const { roleFilteredMenu } = useRoleFilteredMenu();
const { 
  searchQuery, filteredMenu, finalExpandedGroups, 
  finalExpandedMenu, toggleGroup, toggleSubmenu 
} = useMenuFilter(roleFilteredMenu);

const authStore = useAuthStore();
const toast = useToast();

function handleLogout() {
  authStore.logout();
  toast.success('Boli ste úspešne odhlásený!');
  navigateTo('/login');
}
</script>

<style scoped>

.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100svh;
  height: 100dvh;
  background: var(--sidebar-bg);
  color: var(--sidebar-text-color);
  border-right: 1px solid var(--sidebar-border-color);
  border-radius: 0 12px 12px 0;
  box-shadow: 0 8px 20px var(--sidebar-shadow);
  transition: width 350ms cubic-bezier(0.4, 0, 0.2, 1), background 350ms ease-in-out;
  user-select: none;
  padding-bottom: env(safe-area-inset-bottom)}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(148,163,184,0.3) transparent}

.sidebar--collapsed {width: 4rem;}
.sidebar--expanded {width: 16rem;}

.sidebar-content::-webkit-scrollbar {width: 8px}
.sidebar-content::-webkit-scrollbar-track {background: transparent}
.sidebar-content::-webkit-scrollbar-thumb:hover {background-color: var(--color-btn-gradient-from)}
.sidebar-content::-webkit-scrollbar-thumb {
  background-color: rgba(148,163,184,0.35);
  border-radius: 6px;
  transition: background-color 0.2s ease}

html.dark .sidebar { box-shadow: inset -1px 0 0 var(--sidebar-border-color),0 10px 15px rgba(0,0,0,.25);}

</style>