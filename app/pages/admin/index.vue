<template>
    <div>
      <h1>🔑 Admin Panel</h1>
      <p>Táto stránka je viditeľná iba pre administrátorov.</p>
      <div v-if="authStore.user">
          <p>Prihlásený ako: <strong>{{ authStore.user.name }} ({{ authStore.user.role }})</strong></p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useAuthStore } from '~/shared/stores/authStore';
  
  // Tento blok je ten "pokyn" pre cieleného vrátnika
  definePageMeta({
    middleware: 'admin' // Hovorí: "Na ochranu tejto stránky použi middleware s názvom 'admin'"
  });
  
  const authStore = useAuthStore();
  </script>