<template>
  <div>
    <div v-if="isAppLoading">
      <LoadingSpinner />
    </div>

    <div v-else>
      <NuxtLayout>
        <NuxtPage />y
      </NuxtLayout>
    </div>

    <div v-if="isPageLoading" class="page-loading-overlay">
      <LoadingSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import 'vue-toastification/dist/index.css'

const isAppLoading = useIsAppLoading()
const isPageLoading = useIsPageLoading()
</script>

<style>
.page-loading-overlay {
  position: fixed; inset: 0;
  display: flex; justify-content: center; align-items: center;
  background-color: rgba(255,255,255,.7);
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.vue-toastification__container {
  z-index: 10000;
}
</style>
