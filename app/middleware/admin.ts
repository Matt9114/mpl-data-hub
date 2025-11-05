// app/middleware/admin.ts
import { useAuthStore } from '~/shared/stores/authStore';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Ak používateľ nie je admin, presmerujeme ho na jeho profil
  if (!authStore.isAdmin) {
    console.warn('Prístup zamietnutý. Používateľ nie je administrátor.');
    return navigateTo('/profil', { replace: true });
  }
});