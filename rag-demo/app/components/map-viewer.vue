<script lang="ts" setup>
import { onMounted, watch, useTemplateRef } from 'vue';
import { log } from '@/utils';
// import type { ExtractProperties, NonFunctionProperties } from '~/typings';
import { useAppState } from '~/store/app';

import type { ArcgisMap } from '@arcgis/map-components/components/arcgis-map';

// type Props = Partial<NonFunctionProperties<ArcgisMap>>

// type Props = Partial<InstanceType<typeof ArcgisMap> & { basemap?: string }>;

const mapRef = useTemplateRef<InstanceType<typeof ArcgisMap>>('mapRef');

//   // @ts-ignore @ts-nocheck
// type Props = Partial<__esri.MapViewProperties> & {
//   basemap?: string;
// };

type Props = {
  basemap?: string;
  [key: string]: any;
};

const props = defineProps<Props>();

onMounted(() => {
  if (import.meta.client) {
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
  }
})

const onMapLoaded = (e: any) => {
  console.log('Map has been loaded', e);
};
</script>

<template>
  <arcgis-map v-bind="props as any" @load="onMapLoaded" ref="mapRef">
    <arcgis-expand 
      position="top-right" 
      expand-icon="basemap" 
      expand-tooltip="Show Basemap" 
      :view-model="{ view: mapRef?.view }"
      @arcgisViewReadyChange="onMapLoaded"
    >
      <arcgis-basemap-gallery></arcgis-basemap-gallery>
    </arcgis-expand>
    <slot></slot>
  </arcgis-map>
</template>