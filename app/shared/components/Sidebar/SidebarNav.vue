<!--app/components/Sidebar/SidebarNav.vue-->
<template>
  <nav class="sidebar-nav">
    <template v-if="menu.length > 0">
      <ul class="sidebar-nav-list">
        <li v-for="(group, gIndex) in menu" :key="gIndex">
          <button
            @click="$emit('toggle-group', group.name)"
            class="sidebar-group-button"
            :class="{ 'sidebar-group-active': isGroupActive(group) }"
            :title="isCollapsed ? group.name : ''"
          >
            <div class="sidebar-group-icon-container">
              <component :is="getIcon(group.icon)" class="sidebar-group-icon-svg" />
            </div>
            <span v-if="!isCollapsed && showText">{{ group.name }}</span>
            <transition name="fade">
              <ChevronRightIcon
                v-if="!isCollapsed && showText"
                class="sidebar-chevron-icon"
                :class="{ 'rotate-90': finalExpandedGroups.has(group.name) }"
              />
            </transition>
          </button>
          <transition
            name="accordion-bounce"
            @enter="enterAccordion"
            @after-enter="afterAccordion"
            @leave="leaveAccordion"
          >
            <ul
              v-if="!isCollapsed && showText && finalExpandedGroups.has(group.name)"
              class="sidebar-group-dropdown"
            >
              <li v-for="item in group.items" :key="item.key">
                <template v-if="item.to">
                  <NuxtLink
                    :to="item.to"
                    class="sidebar-link"
                    :class="{ 'sidebar-link-active': isActiveRoute(item.to) }"
                    :title="isCollapsed ? item.label : ''"
                  >
                    <div v-if="isCollapsed" class="sidebar-tooltip">
                      {{ item.label }}
                    </div>
                    <transition name="fade">
                      <span v-if="!isCollapsed && showText" class="sidebar-link-text">
                        {{ item.label }}
                      </span>
                    </transition>
                  </NuxtLink>
                </template>
                <template v-else-if="item.routes">
                  <button
                    class="sidebar-submenu-button"
                    :class="{ 'sidebar-submenu-button-active': isItemActive(item) }"
                    @click="$emit('toggle-submenu', item.key)"
                    :title="isCollapsed ? item.label : ''"
                  >
                    <div v-if="isCollapsed" class="sidebar-tooltip">
                      {{ item.label }}
                    </div>
                    <transition name="fade">
                      <span v-if="!isCollapsed && showText" class="sidebar-link-text">
                        {{ item.label }}
                      </span>
                    </transition>
                    <transition name="fade">
                      <ChevronRightIcon
                        v-if="!isCollapsed && showText"
                        class="sidebar-chevron-icon"
                        :class="finalExpandedMenu.has(item.key) ? 'rotate-90' : ''"
                      />
                    </transition>
                  </button>
                  <transition
                    name="accordion-bounce"
                    @enter="enterAccordion"
                    @after-enter="afterAccordion"
                    @leave="leaveAccordion"
                  >
                    <ul
                      v-if="!isCollapsed && showText && finalExpandedMenu.has(item.key)"
                      class="sidebar-submenu-list"
                    >
                      <li v-for="(routeItem, rIndex) in item.routes" :key="rIndex">
                        <NuxtLink
                          :to="routeItem.to"
                          class="sidebar-submenu-link"
                          :class="{ 'sidebar-submenu-link-active': isActiveRoute(routeItem.to) }"
                        >
                          {{ routeItem.label }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </transition>
                </template>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </template>
    <template v-else>
      <div class="no-results">
        <em>No results</em>
      </div>
    </template>
  </nav>
</template>

<script setup lang="ts">
import type { MenuGroup, MenuItem } from '~/shared/composables/Sidebar/useMenuData'
import { getIcon } from '~/shared/composables/Sidebar/useMenuData' 
import { useRoute } from 'vue-router';
import { ChevronRightIcon } from '@heroicons/vue/24/outline';
const TRANSITION_MS = 350;
const route = useRoute();

defineProps<{
  menu: MenuGroup[];
  isCollapsed: boolean;
  showText: boolean;
  finalExpandedGroups: Set<string>;
  finalExpandedMenu: Set<string>;
}>();

defineEmits(['toggle-group', 'toggle-submenu']);

// Funkcie na kontrolu aktívnych trás
function isActiveRoute(path: string): boolean {
  const currentPath = route.path;
  return path === '/' ? currentPath === '/' : currentPath === path || currentPath.startsWith(path + '/');
}

function hasActiveChildRoute(routes: { to: string }[]): boolean {
  return routes.some(r => isActiveRoute(r.to));
}

function isItemActive(item: MenuItem): boolean {
  return (item.to && isActiveRoute(item.to)) || (item.routes && hasActiveChildRoute(item.routes)) || false;
}

function isGroupActive(group: MenuGroup): boolean {
  return group.items.some(isItemActive);
}

// Animácie pre akordeón
function enterAccordion(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = '0';
  htmlEl.style.opacity = '0';
  htmlEl.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    htmlEl.style.transition = `height ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${TRANSITION_MS}ms`;
    htmlEl.style.height = htmlEl.scrollHeight + 'px';
    htmlEl.style.opacity = '1';
  });
  setTimeout(done, TRANSITION_MS);
}

function leaveAccordion(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = htmlEl.scrollHeight + 'px';
  htmlEl.style.opacity = '1';
  htmlEl.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    htmlEl.style.transition = `height ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${TRANSITION_MS}ms`;
    htmlEl.style.height = '0';
    htmlEl.style.opacity = '0';
  });
  setTimeout(done, TRANSITION_MS);
}

function afterAccordion(el: Element) {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = 'auto';
}
</script>

<style scoped>
/* Navigácia */
.sidebar-nav {
  margin-top: 0.25rem;
}
.sidebar-nav-list {
  padding: 0 0.5rem;
  list-style: none;
  margin: 0;
}
.sidebar-nav-list > li {
  margin-bottom: 0.25rem;
}
.no-results {
  padding: 0.75rem 1rem;
  color: #6b7280;
  font-size: 0.775rem;
  font-style: italic;
}
/* Skupinové tlačidlá */
.sidebar-group-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.55rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--group-button-text-color);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 350ms ease, transform 350ms ease, box-shadow 350ms ease;
}
.sidebar-group-active {
  font-weight: 600;
  color: var(--submenu-link-active-color);
}
.sidebar-group-icon-container {
  width: 1.5rem;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  margin-right: 0.5rem;
}
.sidebar-group-icon-svg {
  width: 1.25rem;
  height: 1.25rem;
}
.sidebar-chevron-icon {
  margin-left: auto;
  width: 1rem;
  height: 1rem;
  color: var(--submenu-chevron-color);
  transition: transform 350ms ease;
}
.rotate-90 {
  transform: rotate(90deg);
}
.sidebar-group-dropdown {
  list-style: none;
  padding: 0 1.75rem;
  margin: 0.05rem 0;
}
/* Submenu */
.sidebar-submenu-button {
  display: flex;
  align-items: center;
  width: 100%;
  height: 1.75rem;
  border-radius: 0.375rem;
  padding: 0 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  color: inherit;
  transition: background-color 350ms ease, transform 350ms ease, box-shadow 350ms ease;
}
.sidebar-submenu-button-active {
  font-weight: 600;
  color: var(--submenu-link-active-color);
}
.sidebar-submenu-list {
  margin-left: 2rem;
  border-left: 1px solid var(--submenu-border-color);
  padding-left: 0.75rem;
  overflow: hidden;
  list-style: none;
  margin-top: 0;
}
.sidebar-submenu-link {
  display: block;
  padding: 0.25rem 0;
  font-size: 0.775rem;
  color: var(--submenu-link-text);
  text-decoration: none;
  transition: background-color 350ms ease, transform 350ms ease, box-shadow 350ms ease;
}
.sidebar-submenu-link-active {
  font-weight: 600;
  color: var(--submenu-link-active-color);
}
/* Odkazy v menu */
.sidebar-link {
  display: flex;
  align-items: center;
  height: 1.75rem;
  border-radius: 0.375rem;
  padding: 0 0.7rem;
  position: relative;
  text-decoration: none;
  color: inherit;
  transition: background-color 350ms ease, transform 350ms ease, box-shadow 350ms ease;
}
.sidebar-link-active {
  font-weight: 600;
  color: var(--submenu-link-active-color);
}
/* Spoločné hover efekty */
.sidebar-group-button:hover,
.sidebar-link:hover,
.sidebar-submenu-button:hover,
.sidebar-submenu-link:hover {
  color: var(--submenu-link-active-hover-color);
  font-weight: 600;
  transform: translateX(4px);
}
/* Tooltip pri collapsed sidebar */
.sidebar-tooltip {
  position: absolute;
  left: 4.5rem;
  background-color: var(--tooltip-bg);
  color: var(--tooltip-text);
  font-size: 0.75rem;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transition: opacity 350ms ease;
  z-index: 50;
  pointer-events: none;
  white-space: nowrap;
}
/* Show tooltip on hover */
.sidebar-link:hover .sidebar-tooltip,
.sidebar-submenu-button:hover .sidebar-tooltip {
    opacity: 1;
    visibility: visible;
}
.sidebar-link-text {
  margin-left: 0.75rem;
  font-size: 0.775rem;
  line-height: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Animácie */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 350ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.accordion-bounce-enter-active,
.accordion-bounce-leave-active {
  overflow: hidden;
}
</style>