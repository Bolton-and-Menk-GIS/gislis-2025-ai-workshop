<script lang="ts" setup>
import { useTemplateRef, defineAsyncComponent, ref, shallowRef, watch, watchEffect } from 'vue'
import type { ArcgisMapCustomEvent } from '@arcgis/map-components';
import { watch as esriWatch } from '@arcgis/core/core/reactiveUtils';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import { debounce, log, updateHook } from '@/utils';
import { useStorage } from '@vueuse/core';
import { useAppState } from '@/stores';
import FeatureEffect from '@arcgis/core/layers/support/FeatureEffect';
import type { RagResponse } from '@/typings';

const MapViewer = defineAsyncComponent(() => import('./MapViewer.vue'));
const ChatBot = defineAsyncComponent(() => import('@/components/ChatBot.vue'));

const chatExpand = useTemplateRef<HTMLArcgisExpandElement>('chatExpand');
const extent = ref<__esri.ExtentProperties>();
const selectedOIDs = useStorage<number[]>('rag-selected-oids', [], localStorage, { mergeDefaults: true });
const layerView = shallowRef<__esri.FeatureLayerView>();

const appStore = useAppState()
const demoConfig = appStore.config.demos.rag

const clearLayerFilter = () => {
  selectedOIDs.value = [];
}

const onMapReady = (e: ArcgisMapCustomEvent<void>)  => {
  log('[RAG Demo]: Map is ready!', e);
  const view = e.target!.view;

  const layer = view.map?.layers.find(l => l.title === 'Public Comments') as __esri.FeatureLayer;

  view.whenLayerView(layer).then(async (lv) => {  
    // hide empty comments
    layer.definitionExpression = "Comment <> '-' AND Comment IS NOT NULL"; 
    log('[RAG Demo]: found "Public Comments" layer...');
    layerView.value = lv;
    updateHook({ layerView: lv });
  })

  debounce(
    // @ts-expect-error // type issue 
    esriWatch(() => [view.stationary], (stationary) => {
      if (stationary) {
        extent.value = webMercatorToGeographic(view.extent)?.toJSON();
      } 
    }), 2000
  )

  watchEffect(()=> {
    log('[RAG Demo]: Selected OIDs changed:', selectedOIDs.value);
    if (layerView.value){
      if (selectedOIDs.value.length === 0) {
        layerView.value.featureEffect = null;
      } else {
        layerView.value.featureEffect = new FeatureEffect({
          filter: {
              where: `OBJECTID IN (${selectedOIDs.value.join(',')})`,
            },
            includedEffect: "bloom(5.5, 1px, 0.1)",
            excludedEffect: "opacity(20%)"
          })
        }
      }
    }
  )
}

const onCloseChat = () => {
  if (chatExpand.value) {
    chatExpand.value.collapse();
  }
}

const onRagResult = (e: RagResponse) => {
  log('RAG Result received in RAGDemo:', e);
  selectedOIDs.value = e.features?.map(f => f.objectid) ?? [];
}

const onClearHistory = () => {
  clearLayerFilter()
}

</script>

<template>
  <div class="rag-demo--container">
    <Suspense>
      <MapViewer
        id="rag-map"
        zoom="13"
        center="-93.249915, 45.0409531548259"
        basemap="gray-vector"
        :item-id="demoConfig.map?.webmapId || ''"
        :switch-basemap-on-theme-change="false"
        @map-ready="onMapReady"
      >
        <arcgis-expand 
          ref="chatExpand"
          position="top-right" 
          expand-icon="effects" 
          expand-tooltip="Chat with the map"
        >
          <arcgis-placement>
            <ChatBot 
              :extent="extent"
              storage-key="map-chat-messages"
              @rag-response="onRagResult"
              @clear-history="onClearHistory"
              @close="onCloseChat"
            />
          </arcgis-placement>
        </arcgis-expand>

        <arcgis-placement 
          v-if="selectedOIDs.length > 0"
          position="top-right" 
          class="esri-widget esri-component" 
        >
          <calcite-button 
            scale="m"
            kind="neutral"
            title="Clear Feature Effect Filter"
            class="esri-widget--button"
            icon-start="selection-filter" 
            @click="clearLayerFilter"
          >
            <!-- <calcite-tooltip>Clear Feature Effect Filter</calcite-tooltip> -->
          </calcite-button>
        </arcgis-placement>

      </MapViewer>

      <template #fallback>
        <calcite-loader active></calcite-loader>
      </template>

    </Suspense>
  </div>
</template>

<style lang="scss">
#rag-map {
  height: calc(100vh - 60px);
  width: 100vw;
}
</style>