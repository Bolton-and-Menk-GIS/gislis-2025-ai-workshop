<script lang="ts" setup>
import { useTemplateRef, defineAsyncComponent, ref } from 'vue'
import type { ArcgisMapCustomEvent } from '@arcgis/map-components';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import { debounce, log } from '@/utils';

const MapViewer = defineAsyncComponent(() => import('./MapViewer.vue'));
const ChatBot = defineAsyncComponent(() => import('@/components/ChatBot.vue'));

const chatExpand = useTemplateRef<HTMLArcgisExpandElement>('chatExpand');
const extent = ref<__esri.ExtentProperties>();

const onMapReady = (e: ArcgisMapCustomEvent<void>)  => {
  console.log('Map is ready!', e);
  const view = e.target!.view;

  debounce(
    // @ts-expect-error // type issue 
    watch(() => [view.stationary], (stationary) => {
      if (stationary) {
        extent.value = webMercatorToGeographic(view.extent)?.toJSON();
      } 
    }), 1000
  )
}

const onCloseChat = () => {
  if (chatExpand.value) {
    chatExpand.value.collapse();
  }
}

const onRagResult = (e) => {
  log('RAG Result received in RAGDemo:', e);
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
        item-id="751d520b5f384283aab7f6ff09bcd78e"
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
              @message-received="onRagResult"
              @close="onCloseChat"
            />
          </arcgis-placement>
        </arcgis-expand>

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