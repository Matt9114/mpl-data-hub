import { watch } from 'vue'
// app/composables/useTheme.ts
import { useStorage } from '@vueuse/core';

export function useTheme() {
  // Použijeme useStorage, aby si prehliadač pamätal poslednú nastavenú tému
  const theme = useStorage<'light' | 'dark'>('theme-preference', 'light');

  // Funkcia na prepnutie témy
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  // Táto časť sleduje zmeny v `theme` a automaticky pridáva/odstraňuje
  // CSS triedu 'dark' na hlavnom <html> elemente stránky.
  // Väčšina CSS frameworkov (vrátane Tailwind CSS) takto riadi tmavý režim.
  watch(theme, (newTheme) => {
    if (process.client) {
      const html = document.documentElement;
      html.classList.remove('light', 'dark');
      html.classList.add(newTheme);
    }
  }, { immediate: true }); // `immediate: true` zabezpečí, že sa to spustí hneď pri načítaní

  return {
    theme,
    toggleTheme,
  };
}