<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useAppState } from './store/app';

if (import.meta.client){
  const appState = useAppState()
  appState.loadInitialTheme()
}

// import { useQuasar } from 'quasar'
// const $q = useQuasar()
// $q.dark.set('auto')
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
