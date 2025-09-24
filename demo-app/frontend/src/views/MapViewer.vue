<script lang="ts" setup>
import { onMounted, watch, useTemplateRef } from 'vue';
import { log } from '@/utils';
// import type { ExtractProperties, NonFunctionProperties } from '~/typings';
import { useAppState } from '@/stores/app';

import type { ArcgisMap } from '@arcgis/map-components/components/arcgis-map';

// type Props = Partial<NonFunctionProperties<ArcgisMap>>
// type Props = Partial<__esri.MapViewProperties>;

const mapRef = useTemplateRef<InstanceType<typeof ArcgisMap>>('mapRef');

type Props = {
  basemap?: ArcgisMap['basemap'];
  center?: ArcgisMap['center'];
  zoom?: ArcgisMap['zoom'];
  [key: string]: unknown;
};

// type Props = Pick<__esri.MapViewProperties, | 'center' | 'zoom'> & {
//   basemap?: ArcgisMap['basemap'];
//   [key: string]: unknown;
// }

const props = defineProps<Props>();

onMounted(() => {
  const appStore = useAppState();
  watch(()=> appStore.isDark,
  (dark)=> {
    log('Map Viewer - Dark mode changed:', dark);
    if (mapRef.value) {
      // Example: Change map style based on dark mode
      mapRef.value.basemap = dark ? 'streets-night-vector' : 'topo-vector';
      log('[Map Viewer]: Map style updated to:', mapRef.value.basemap);
    }

    // You can add logic here to update the map style based on dark mode
  }, { immediate: true });
})

const onMapLoaded = (e: CustomEvent) => {
  console.log('Map has been loaded', e);
};
</script>

<template>
  <arcgis-map v-bind="props" @load="onMapLoaded" ref="mapRef">
    <arcgis-zoom position="top-left"></arcgis-zoom>
    <arcgis-home position="top-left" />
    
    <arcgis-expand 
      position="top-left" 
      
    >
      <arcgis-legend />
    </arcgis-expand>

    <arcgis-expand position="top-left" expand-icon="layers" expand-tooltip="Show Layers" :view-model="{ view: mapRef?.view }">
      <arcgis-placement>
        <arcgis-layer-list />
      </arcgis-placement>
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