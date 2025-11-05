// plugins/01.auth.ts
export default defineNuxtPlugin(async (nuxtApp) => {
    const isLoading = useIsAppLoading();
  
    // Tento plugin iba simuluje overenie pri štarte.
    // Vďaka useStorage v Pinia store sa stav `user` načíta automaticky.

    isLoading.value = false; // Ukončíme načítavanie
  });