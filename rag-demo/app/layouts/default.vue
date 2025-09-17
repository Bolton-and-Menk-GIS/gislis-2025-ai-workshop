<script setup lang="ts">
import AppNavbar from '~/components/app/nav-bar.vue'
</script>
<template>
  <header>
    <AppNavbar />
  </header>
  <main class="container-fluid">
    <slot />
  </main>
</template>

<style lang="scss">

</style>