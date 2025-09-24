/// <reference path="@arcgis/map-components"
import { shallowRef, watch } from 'vue'
import { useAppState } from '@/stores'
import type { ArcgisMap } from '@arcgis/map-components/components/arcgis-map'
import type { ArcgisMapCustomEvent, } from '@arcgis/map-components'

export const useMap = ()=> {
  const mapView = shallowRef<ArcgisMap>()

  const onMapReady = (e: ArcgisMap['arcgisViewReadyChange']) => {
    mapView.value = e.target
  }
  
  return {
    mapView,
    onMapReady,
  }

}