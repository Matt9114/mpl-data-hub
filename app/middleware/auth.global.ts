import { useAuthStore } from '~/shared/stores/authStore';

export default defineNuxtRouteMiddleware((to, from) => {
  // Zoznam verejných stránok sme zredukovali iba na prihlasovaciu stránku.
  const publicRoutes = ['/login'];

  // Ak je cieľová cesta verejná (/login), nerobíme nič.
  if (publicRoutes.includes(to.path)) {
    return;
  }

  const authStore = useAuthStore();

  // Pre VŠETKY OSTATNÉ stránky platí:
  // Ak používateľ NIE JE prihlásený, presmerujeme ho na /login.
  if (!authStore.isLoggedIn) {
    return navigateTo('/login', { replace: true });
  }
});