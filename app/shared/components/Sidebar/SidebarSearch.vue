<!--app/components/Sidebar/SidebarSearch.vue-->
<template>
  <div class="sidebar-search">
    <div class="sidebar-search-box" :title="isCollapsed ? 'Search' : ''">
      <div class="sidebar-search-icon-container">
        <MagnifyingGlassIcon class="sidebar-search-icon-svg" />
      </div>
      <transition name="search-transition">
        <div v-if="!isCollapsed && showText" class="search-input-wrapper">
          <input
            :value="modelValue"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            type="text"
            class="sidebar-search-input"
            placeholder="Search menu..."
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

defineProps<{
  modelValue: string;
  isCollapsed: boolean;
  showText: boolean;
}>();

defineEmits(['update:modelValue']);
</script>

<style scoped>
.sidebar-search {
  padding: 0.5rem;
  margin-bottom: 0;
}
.sidebar-search-box {
  display: flex;
  align-items: center;
  height: 2rem;
  border-radius: 0.375rem;
  padding: 0 0.75rem;
  transition: background-color 350ms ease;
  position: relative;
}
.sidebar-search-icon-container {
  width: 1.5rem;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.sidebar-search-icon-svg {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--search-icon-color);
}
.search-input-wrapper {
  width: 100%;
}
.sidebar-search-input {
  width: 100%;
  padding: 0.5rem 0.5rem;
  font-size: 0.775rem;
  line-height: 1.25rem;
  background-color: transparent;
  color: var(--search-text-color);
  border: none;
  outline: none;
  transition: box-shadow 350ms ease;
  border-bottom: 0.5px solid var(--search-border-color);
}
.sidebar-search-input::placeholder {
  color: var(--placeholder-color);
}
.search-transition-enter-active,
.search-transition-leave-active {
  transition: all 350ms ease-in-out;
}
.search-transition-enter-from,
.search-transition-leave-to {
  opacity: 0;
  transform: translateX(-5px);
}
</style>