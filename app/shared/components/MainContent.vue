<template>
  <div class="custom-container">
    <slot />
  </div>
</template>

<style scoped>
.custom-container {
  flex: 1 1 auto;
  min-width: 0;
  overflow: visible;
  padding: .7rem;
  background-color:rgba(30,41,59,.667);
  transition: padding 350ms ease;
  border-radius: 15px;
}
</style>
