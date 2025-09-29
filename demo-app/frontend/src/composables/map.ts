/// <reference path="@arcgis/map-components"
import { shallowRef, ref, watch } from 'vue'
import { useAppState } from '@/stores'
import type { ArcgisMap } from '@arcgis/map-components/components/arcgis-map'
import type { ArcgisMapCustomEvent } from '@arcgis/map-components'

export const useMap = ()=> {
  const mapView = shallowRef<ArcgisMap>()
  const ready = ref(false)

  const onMapReady = (e: ArcgisMapCustomEvent<void>) => {
    mapView.value = e.target
    ready.value = true
  }
  
  return {
    mapView,
    onMapReady,
  }

}