import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { defineCustomElements as defineCalciteElements } from '@esri/calcite-components/dist/loader'
import { defineCustomElements as defineCustomMapElements } from '@arcgis/map-components/dist/loader'
// import '@esri/calcite-components'
defineCalciteElements(window)
defineCustomMapElements(window)

// calcite and pico css
import '@esri/calcite-components/dist/calcite/calcite.css'
import '@picocss/pico/css/pico.colors.min.css'
import '@picocss/pico/css/pico.conditional.min.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
