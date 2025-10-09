<script lang="ts" setup>
import { onMounted, watch, useTemplateRef, onUnmounted } from 'vue';
import { useAppState } from '@/stores/app';
import type { ArcgisMapCustomEvent } from '@arcgis/map-components';
import { log } from '@/utils';

const emit = defineEmits<{
  (e: 'map-ready', event: ArcgisMapCustomEvent<void>): void;
  (e: 'destroyed'): void;
}>();

const mapRef = useTemplateRef<HTMLArcgisMapElement>('mapRef');

type Props = {
  zoom?: number | string;
  center?: __esri.Point | number[] | string;
  itemId?: string;
  basemap?: string | __esri.Basemap;
  switchBasemapOnThemeChange?: boolean;
  basemapDark?: string | __esri.Basemap;
  basemapLight?: string | __esri.Basemap;
  [key: string]: unknown;
};

const { 
  itemId, 
  basemap, 
  zoom=10,
  center=[-93.35,44.96],
  basemapDark='dark-gray-vector', 
  basemapLight='topo-vector', 
  switchBasemapOnThemeChange=true,
} = defineProps<Props>();  

const bindableProps = {
  itemId,
  basemap,
  center,
  zoom,
};

onMounted(() => {
  mapRef.value?.addEventListener('arcgisViewReadyChange',(e) => {
    log('Map has been loaded', e);
    emit('map-ready', e);
  })

  if (!basemap && basemapDark && basemapLight && switchBasemapOnThemeChange) {
    const appStore = useAppState();
    watch(()=> appStore.isDark,
    (dark)=> {
      log('Map Viewer - Dark mode changed:', dark);
      if (mapRef.value) {
        // Example: Change map style based on dark mode
        mapRef.value.basemap = dark ? basemapDark: basemapLight;
        log('[Map Viewer]: Map style updated to:', mapRef.value.basemap);
      }
  
      // You can add logic here to update the map style based on dark mode
    }, { immediate: true });
  }
})

const onMapLoaded = (e: ArcgisMapCustomEvent<void>) => {
  console.log('Map has been loaded', e);
  emit('map-ready', e);
};

onUnmounted(() => {
  if (mapRef.value) {
    // Remove the element from the DOM
    mapRef.value.remove()
    emit('destroyed');
    log('MapViewer: map element removed from DOM on unmount');
  }
})

</script>

<template>
  <arcgis-map 
    :key="$route.fullPath"
    v-bind="(bindableProps as any)" 
    ref="mapRef"
    @arcgis-view-ready-change="onMapLoaded" 
  >
    <arcgis-zoom position="top-left"></arcgis-zoom>
    <arcgis-home position="top-left" />
    
    <arcgis-expand position="top-left">
      <arcgis-legend />
    </arcgis-expand>

    <arcgis-expand position="top-left" expand-tooltip="Show Layers" >
      <arcgis-layer-list />
    </arcgis-expand>

    <arcgis-search position="top-right" />
    <arcgis-scale-bar position="bottom-left" unit="dual"/>

    <arcgis-expand 
      position="top-right" 
    >
      <arcgis-basemap-gallery />
    </arcgis-expand>

    <!-- additional content can be added in parent component -->
    <slot></slot>
  </arcgis-map>
</template>