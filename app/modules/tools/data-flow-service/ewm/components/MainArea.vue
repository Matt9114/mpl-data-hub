<template>
  <div class="main-area-container">
    <slot />
  </div>
</template>

<style scoped>
.main-area-container {
  display: flex;
  flex-direction: column; /* Usporiada MainNav a NuxtPage POD SEBA */
  flex: 1;               /* Zdedí príkaz na roztiahnutie od svojho rodiča */
  min-height: 0;         /* Nevyhnutný trik pre flexbox */
}

/*
  Toto je tá "mágia". Hovoríme:
  "Prvé dieťa v slote (MainNav) si zoberie svoju prirodzenú výšku."
  "Všetky ostatné deti (NuxtPage) nech sa roztiahnu a vyplnia zvyšok."
*/
:slotted(> :nth-child(n+2)) {
  flex: 1;
  min-height: 0;
  display: flex; /* Dôležité, aby sa obsah v NuxtPage mohol tiež roztiahnuť */
}
</style>