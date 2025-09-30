import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { defineCustomElements as defineCalciteElements } from '@esri/calcite-components/dist/loader'
import { defineCustomElements as defineCustomMapElements } from '@arcgis/map-components/dist/loader'
import { loadConfig, log, createHook } from '@/utils'
defineCalciteElements(window)
defineCustomMapElements(window)

// calcite and pico css
import '@esri/calcite-components/dist/calcite/calcite.css'
import '@picocss/pico/css/pico.colors.min.css'
import '@picocss/pico/css/pico.conditional.min.css'

import App from './App.vue'
import router from './router'

createHook()

const app = createApp(App)

app.use(createPinia())
app.use(router)

loadConfig().then(async (conf) => {
  const { useAppState } = await import('@/stores')
  const appStore = useAppState()
  appStore.config = conf
  log('[main]: loaded application configuration: ', conf)
  app.mount('#app')
})

