<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAppState } from '@/stores';
import AppNavBar from '@/components/AppNavBar.vue';

const appState = useAppState()
appState.loadInitialTheme()

</script>

<template>
  <header>
    <app-nav-bar />
  </header>
  <main class="container-fluid main-view">
    <RouterView />
  </main>
</template>

<style lang="scss">
.main-view {
  height: calc(100vh - 70px);
  width: 100%;
}
</style>
