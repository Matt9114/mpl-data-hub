<!--app/components/Sidebar/SidebarHeader.vue-->
<template>
  <div class="sidebar-header">
    <div class="sidebar-logo-container">
      <CubeTransparentIcon class="sidebar-logo-icon" />
    </div>
    <transition name="fade-slide">
      <span v-if="!isCollapsed && showText" class="sidebar-title">
        Dataflow
      </span>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { CubeTransparentIcon } from '@heroicons/vue/24/outline';

defineProps<{
  isCollapsed: boolean;
  showText: boolean;
}>();
</script>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 0 0.7rem;
  height: 4rem;
  transition: border-color 350ms ease;
  flex-shrink: 0;
}
.sidebar-logo-container {
  width: 2.5rem;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.sidebar-logo-icon {
  width: 2rem;
  height: 2rem;
  color: var(--header-logo-color);
  transition: transform 350ms ease;
}
.sidebar-logo-icon:hover {
  transform: rotate(15deg) scale(1.1);
}
.sidebar-title {
  margin-left: 0.75rem;
  font-size: 1.25rem;
  font-weight: bold;
  white-space: nowrap;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 350ms ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>