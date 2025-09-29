import { shallowRef } from 'vue'

interface usePLSSLayersOptions {
  view: __esri.MapView;
  fortysLayerName?: string;
  townshipsLayerName?: string;
  sectionsLayerName?: string
}

export const usePLSSLayers = (options: usePLSSLayersOptions) => {
  const {
    view,
    fortysLayerName = "PLSS Intersected",
    townshipsLayerName = "PLSS Township",
    sectionsLayerName = "PLSS First Division",
  } = options

  const map = view.map!

  const fortysLayer = shallowRef(
    map.allLayers.find(l => l.title === fortysLayerName) as __esri.FeatureLayer
  )
  const townshipsLayer = shallowRef(
    map.allLayers.find(l => l.title === townshipsLayerName) as __esri.FeatureLayer
  )
  const sectionsLayer = shallowRef(
    map.allLayers.find(l => l.title === sectionsLayerName) as __esri.FeatureLayer
  )

  return {
    map,
    view, 
    townshipsLayer,
    sectionsLayer,
    fortysLayer,
  }
}