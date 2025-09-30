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
  surveyInfos.value = []
  legalDescriptions.value = []
}

</script>

<template>
  <Suspense>
    <MapViewer
      id="survey-map"
      basemap="hybrid"
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
            <PDFUploader @upload="onUploadPDF" @reset="clearPDF" ref="pdfUploader" />
            <div class="survey-pdf--actions">
              <div class="pico survey-pdf--busy mx-auto" v-if="pdf.file.value && pdf.busy.value">
                <!-- <article  
                  class="pico survey-pdf--progress pa-lg" 
                  :aria-busy="pdf.busy.value" 
                ></article> -->
                <calcite-loader active v-if="pdf.busy.value" scale="s"></calcite-loader>
                <div class="pb-md progress-message">
                  <i class="pico">{{ pdf.progressMessage }}...</i>
                </div>
              </div>
            </div>

            <div class="survey-pdf--legal">
              <calcite-accordion class="pa-md">

                <calcite-accordion-item 
                  v-for="(legal, idx) in legalDescriptions"
                  :key="`legal-${idx}`"
                  icon-start="file-text"
                  :heading="`Legal Description ${idx + 1}`"
                >
                  <calcite-notice open>
                    <div slot="message" class="legal-description">{{ legal }}</div>
                  </calcite-notice>
                </calcite-accordion-item>
              </calcite-accordion>
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
  max-width: 380px;
}

.legal-description {
  max-height: 200px;
  overflow-y: auto;
}

.survey-pdf--busy {
  text-align: center;
  max-width: 250px;
}
</style>