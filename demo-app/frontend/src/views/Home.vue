<script lang="ts" setup>
import { defineAsyncComponent, useTemplateRef } from 'vue'

const MapViewer = defineAsyncComponent(() => import('./MapViewer.vue'));
const ChatBot = defineAsyncComponent(() => import('@/components/ChatBot.vue'));

const chatExpand = useTemplateRef<HTMLArcgisExpandElement>('chatExpand');

const onCloseChat = () => {
  if (chatExpand.value) {
    chatExpand.value.collapse();
  }
}
</script>

<template>

  <Suspense>
    <MapViewer
      :center="([-93.35,44.96] as any)" 
      :zoom="9"
    >
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