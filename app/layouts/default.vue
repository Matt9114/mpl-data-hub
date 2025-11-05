<!-- app/layouts/default.vue -->

<template>
  <!-- shell nesie background vrstvy -->
  <div class="app-shell relative min-h-svh bg-app-page font-app">
    <!-- Radials (soft glow) -->
    <div class="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div class="radial radial-a"></div>
      <div class="radial radial-b"></div>
      <div class="radial radial-c"></div>
    </div>

    <!-- obsah: sidebar + hlavná plocha (nad pozadím) -->
    <div class="app-layout relative z-10">
      <Sidebar />
      <main class="main-area">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/inner.css'

/* pridáme class na <body> aby sa scope-li app tokeny */
useHead({ bodyAttrs: { class: 'app' } })
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh; /* sidebar + obsah cez celú výšku */
}

.main-area {
  flex: 1 1 auto;
  min-width: 0;        /* dôležité kvôli overflow vnútri */
  overflow: auto;      /* SEM presunieme scroll */
  padding: .7rem;

  /* nech main nemá vlastné pozadie – pozadie ide zo shellu */
  background: transparent;
}
</style>
