<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useAppState } from './store/app';

if (import.meta.client){
  const appState = useAppState()
  appState.loadInitialTheme()
}

</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
