// app/plugins/page-loading.ts
export default defineNuxtPlugin((nuxtApp) => {
  // TENTO RIADOK SA MÁ VYPÍSAŤ PRI ŠTARTE APLIKÁCIE
  console.log('🔌 Plugin pre načítavanie stránok bol úspešne zaregistrovaný!');

  const isPageLoading = useIsPageLoading();

  nuxtApp.hook('page:start', () => {
    // TENTO RIADOK SA MÁ VYPÍSAŤ PRED KAŽDOU NAVIGÁCIOU
    console.log('🚀 Navigácia ZAČALA, zobrazujem spinner...');
    isPageLoading.value = true;
  });

  nuxtApp.hook('page:finish', () => {
    isPageLoading.value = false;
  });
});