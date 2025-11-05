<!-- /components/DataFlowService/Wrapper.vue -->
<template>
  <div class="data-service-wrapper">
    <!-- HEADER -->
    <header class="wrapper-header">
      <div class="header-title">
        <h1>{{ title }}</h1>
      </div>
      <div class="header-actions">
        <slot name="actions"></slot>
      </div>
    </header>

    <!-- CONTENT -->
    <div class="wrapper-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<style scoped>
.data-service-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background-color: rgba(30,41,59,.667);
  color: var(--sidebar-text-color);
}

.wrapper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 0.75rem;
  background-color: rgba(30,41,59,.667);
  font-size: 1.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  border-radius: 10px 10px 0 0;
}

.header-title h1 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.header-actions .btn {
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--sidebar-border-color);
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--submenu-link-active-color);
  transition: background-color 350ms ease, color 350ms ease;
}

.header-actions .btn:hover {
  background-color: var(--submenu-link-active-hover-color);
  color: white;
}

/* toto nám posúva hlavý content contajner ale jeho upravu robíme v MainArea.vue ! */
.wrapper-content {
  flex: 1;             /* vyplní celý zvyšok po headeri */
  min-height: 0;       /* umožní vnútorným flex deťom scrollovať */
  display: flex;       /* aby MainArea vedel rásť */
  padding: 0.5rem;
}

</style>
