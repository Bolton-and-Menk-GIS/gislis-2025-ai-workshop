<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const MapViewer = defineAsyncComponent(() => import('~/components/map-viewer.vue'));
</script>

<template>
  <div class="main-container">
    <ClientOnly>
      <Suspense>
        <map-viewer
          :center="[-93.35,44.96]" 
          :zoom="9"
        ></map-viewer>
        <template #fallback>
          <calcite-loader active></calcite-loader>
        </template>
      </Suspense>
    </ClientOnly>
  </div>
  
</template>

<style lang="scss">
.main-container {
  height: calc(100vh - 70px);
  width: 100%;
}
  /* Add any page-specific styles here */
</style>