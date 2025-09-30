<script lang="ts" setup>
import { ref, watch, onMounted, useTemplateRef } from 'vue'
import { updateHook } from '@/utils';

interface Props {
  referenceElement: string;
}

const { referenceElement } = defineProps<Props>();

const measurementRef = useTemplateRef<HTMLArcgisMeasurementElement>('measurementRef');

const activeTool = ref<HTMLArcgisMeasurementElement['activeTool'] | null>(null);

watch(()=> activeTool.value, (newTool) => {
  console.log('Active tool changed to:', newTool);
  if (measurementRef.value) {
    measurementRef.value.activeTool = newTool;
  }
})

const clear = ()=> {
  measurementRef.value?.clear();
  activeTool.value = null;
}

const onSetTool = (tool: HTMLArcgisMeasurementElement['activeTool']) => {
  if (measurementRef.value) {
    const validatedTool = tool === activeTool.value ? undefined: tool
    activeTool.value = validatedTool;
  }
}

onMounted(() => {
  if (measurementRef.value) {
    console.log('measurementRef onMounted:', measurementRef.value);
    updateHook({ ms: measurementRef.value });
    activeTool.value = measurementRef.value.activeTool 
  }
})
</script>

<template>
  <calcite-card
    id="measure-widget"
    class="measurement-widget--card esri-widget--panel"
    heading="Measurement"
    summary="Measure distances and areas on the map"
    collapsible
    :collapsed="true"
  >
    <div class="measurement-widget--header" slot="heading">
      <div class="pt-sm">Measure</div>
    </div>

    <calcite-action-bar 
      expand-disabled
      scale="s" 
      class="py-sm"
      layout="horizontal" 
      position="start"
    >
      <calcite-action
        scale="s"
        id="measure-distance"
        icon="measure"
        text="Distance"
        :active="activeTool === 'distance'"
        @click="onSetTool('distance')"
      ></calcite-action>

      <calcite-action
        scale="s"
        id="measure-area"
        icon="measure-area"
        text="Area"
        :active="activeTool === 'area'"
        @click="onSetTool('area')"
      ></calcite-action>

      <calcite-action
        scale="s"
        id="measure-clear"
        icon="trash"
        text="Clear"
        @click="clear"
      ></calcite-action>
    </calcite-action-bar>

    <arcgis-measurement
      ref="measurementRef"
      view-mode="2d"
      :reference-element="referenceElement"
      :active-tool="activeTool"
      unit="us-feet"
      area-unit="square-miles"
      length-unit="miles"
      locale="en-us"
    ></arcgis-measurement>

    <calcite-notice :open="!activeTool" width="full" kind="warning" icon="information">
      <div slot="message">please select a measurement tool to begin</div>
    </calcite-notice>
  </calcite-card>
</template>

<style lang="scss">
.measurement-widget--card {
  width: 350px;
  max-width: 90vw;
  font-size: 0.85rem;

  arcgis-measurement {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    width: 100%;
  }

  calcite-action-pad {
    margin-bottom: 0.5rem;
  }
}
</style>