<script lang="ts" setup>
import { ref, watch, useTemplateRef, defineAsyncComponent } from 'vue'
import { usePLSSLayers, usePDF } from '@/composables';
import { useAppState } from '@/stores';
import { updateHook, log } from '@/utils';
import type { SurveyInfo } from '@/typings';
import type { ArcgisMapCustomEvent } from '@arcgis/map-components';
const MapViewer = defineAsyncComponent(() => import('./MapViewer.vue'));
const ChatBot = defineAsyncComponent(() => import('@/components/ChatBot.vue'));
const MeasureWidget = defineAsyncComponent(() => import('@/components/MeasureWidget.vue'));
const PDFUploader = defineAsyncComponent(() => import('@/components/PDFUploader.vue'))

const appStore = useAppState()

const chatExpand = useTemplateRef<HTMLArcgisExpandElement>('chatExpand');
const pdfExpand = useTemplateRef<HTMLArcgisExpandElement>('pdfExpand');
const pdfUploader = useTemplateRef<InstanceType<typeof PDFUploader>>('pdfUploader');
const surveyInfos = ref<SurveyInfo[]>([]);
const legalDescriptions = ref<string[]>([]);

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

const pdf = usePDF()

const onUploadPDF = async (file: File) => {
  log('[SurveyDemo]: PDF File Uploaded:', file)
  pdf.file.value = file
  try {
    const result = await pdf.uploadFileAndExtractSurveyInfo()
    log('PDF Upload and Extract Result:', result)
    surveyInfos.value.push(...result.surveyInfoResults)
    legalDescriptions.value = result.legalDescriptions?.map(ld => ld.text) || []
    
  } catch (error) {
    console.error('Error uploading and extracting PDF:', error)
  }
}


const onMapReady = (e: ArcgisMapCustomEvent<void>) => {
  console.log('Map is ready!', e);
  const view = e.target!.view;

  const plss = usePLSSLayers({ view });
  updateHook({ view, map: view.map, plss })

  // Watch for both to be ready
  watch([surveyInfos.value], async ([surveys]) => {
    log('Survey Infos changed:', surveys)
    if (surveys.length) {
      // when new survey infos are added, create boundaries
      for (const survey of surveys){
        log('Creating survey boundary for:', survey)
        await plss.createSurveyBoundary(survey)
      }
    }
  })
}

const clearPDF = () => {
  pdf.reset()
  pdfUploader.value?.reset()
  surveyInfos.value = []
  legalDescriptions.value = []
}

</script>

<template>
  <Suspense>
    <MapViewer
      id="survey-map"
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
          <div class="survey-pdf--container">
            <PDFUploader @upload="onUploadPDF" ref="pdfUploader" />
            <div class="survey-pdf--actions">
              <button 
                v-if="pdf.file.value"
                class="pico survey-pdf--clear pa-sm" 
                :disabled="!pdf.file.value || pdf.busy.value"
                @click="pdf.reset"
              >Clear</button>

              <div class="pico survey-pdf--busy py-sm" v-if="pdf.file.value && pdf.busy.value">
                <progress 
                  class="pico survey-pdf--progress px-md" 
                  :value="pdf.progress.value" 
                  max="100"
                ></progress>
                <div>
                  <i class="pico">{{ pdf.progressMessage }}</i>
                </div>
              </div>
            </div>

            <div class="survey-pdf--legal">
              <template 
                v-for="(legal, idx) in legalDescriptions"
                :key="`legal-${idx}`"
              >
                <details class="pico pa-md" :name="`Legal Description ${idx + 1}`">
                  <summary class="pico pb-sm">Legal Description {{ idx + 1 }}</summary>
                  <p class="pico legal-description pa-md py-sm">{{ legal }}</p>
                </details>
              </template>
            </div>
          </div>
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

      <arcgis-expand 
        position="bottom-right" 
        expand-icon="measure" 
        expand-tooltip="Measurement Tool"
      >
        <arcgis-placement>
         <MeasureWidget 
          reference-element="measure-widget"
         />
         </arcgis-placement>
      </arcgis-expand>

    </MapViewer>

    <template #fallback>
      <calcite-loader active></calcite-loader>
    </template>

  </Suspense>

</template>

<style lang="scss">
.survey-pdf--legal {
  max-width: 300px;
  max-height: 200px;
  overflow-y: auto;
}

.legal-description {
  border: 1px solid var(--pico-border, #ccc);
  border-radius: 0.5rem;
}

.survey-pdf--busy {
  text-align: center;
  max-width: 250px;
}
</style>