<!-- app/layouts/login.vue -->
<!-- Layout for login pages -->

<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
useHead({ bodyAttrs: { class: 'login' } })
import '~/assets/css/login.css'
</script>

