// filepath: rag-demo/plugins/esri-components.ts
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin( () => {
  if (import.meta.client) {
    // import('@esri/calcite-components/dist/loader').then(module => {
    //   module.defineCustomElements(window)
    // })
    import('@arcgis/map-components/dist/loader').then(module => {
      module.defineCustomElements(window)
    })
  }
})