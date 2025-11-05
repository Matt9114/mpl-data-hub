<template>
  <div v-if="authStore.user">
    <h1>Vitaj, {{ authStore.user.name }}!</h1>
    <div class="profile-card">
      <img :src="authStore.user.avatar" alt="User avatar" />
      <p><strong>Email:</strong> {{ authStore.user.email }}</p>
      </div>
  </div>
</template>
<script setup lang="ts">
import { useAuthStore } from '~/shared/stores/authStore';
// definePageMeta je preč, pretože middleware je globálny
const authStore = useAuthStore();
</script>
<style scoped>
.profile-card { margin-top: 2rem; padding: 2rem; background: #fff; border-radius: 8px; max-width: 400px; }
img { border-radius: 50%; }
</style>