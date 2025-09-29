<script lang="ts" setup>
import { ref, computed, useTemplateRef, defineAsyncComponent } from 'vue'
import { useAppState } from '@/stores';
import type { ArcgisMapCustomEvent } from '@arcgis/map-components';
const MapViewer = defineAsyncComponent(() => import('./MapViewer.vue'));
const ChatBot = defineAsyncComponent(() => import('@/components/ChatBot.vue'));
const PDFUploader = defineAsyncComponent(() => import('@/components/PDFUploader.vue'))

const appStore = useAppState()

const chatExpand = useTemplateRef<HTMLArcgisExpandElement>('chatExpand');
const pdfExpand = useTemplateRef<HTMLArcgisExpandElement>('pdfExpand');

const demoConfig = appStore.config.demos.survey

const onCloseChat = () => {
  if (chatExpand.value) {
    chatExpand.value.collapse();
  }
}

const onClosePDF = () => {
  if (pdfExpand.value) {
    pdfExpand.value.collapse();
  }
}

const onMapReady = (e: ArcgisMapCustomEvent<void>) => {
  console.log('Map is ready!', e);
  const mapComponent = e.target;
  const view = e.target!.view;
  // @ts-expect-error -- ignore --
  window.view = view

  const townships = view.map?.allLayers.find(l => l.title === 'PLSS Township')
  const fortys = view.map?.allLayers.find(l => l.title === 'PLSS Intersected')
  console.log('Townships layer:', townships);
  console.log('Fortys layer:', fortys);
  // @ts-expect-error -- ignore --
  window.townships = townships
  // @ts-expect-error -- ignore --
  window.fortys = fortys
}

</script>

<template>
  <Suspense>
    <MapViewer
        :item-id="demoConfig.map?.webmapId || ''"
        @map-ready="onMapReady"
    >
      <arcgis-expand 
        ref="pdfExpand"
        position="top-right" 
        expand-icon="file-pdf-plus" 
        expand-tooltip="Upload Survey PDF"
      >
        <arcgis-placement>
          <PDFUploader />
        </arcgis-placement>
      </arcgis-expand>

      <arcgis-expand 
        ref="chatExpand"
        position="top-right" 
        expand-icon="effects" 
        expand-tooltip="Chat with the map"
      >
        <arcgis-placement>
          <ChatBot 
            url="http://localhost:8000/api/chat"
            storage-key="map-chat-messages"
            @close="onCloseChat"
          />
        </arcgis-placement>
      </arcgis-expand>

    </MapViewer>

    <template #fallback>
      <calcite-loader active></calcite-loader>
    </template>

  </Suspense>

</template>