// app/stores/authStore.ts
import { defineStore } from 'pinia';
import type { User } from '~/types/user';
import { useStorage } from '@vueuse/core';

export const useAuthStore = defineStore('auth', () => {
  const user = useStorage<User | null>('user-session', null);

  const isLoggedIn = computed(() => !!user.value);

  // --- TOTO SME PRIDALI ---
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isUser = computed(() => user.value?.role === 'user');
  const isManager = computed(() => user.value?.role === 'manager')
  const isGuest   = computed(() => user.value?.role === 'guest')
  // ------------------------

  function login(userData: User) {
    user.value = userData;
  }

  function logout() {
    user.value = null;
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    isUser,
    isManager,
    isGuest,
    login,
    logout,
  };
});