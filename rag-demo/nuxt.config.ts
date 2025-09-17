// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: [
    "@picocss/pico",
    "@picocss/pico/css/pico.colors.min.css",
    "~/assets/styles/main.scss"
  ],
  devServer: {
    port: 3050,
  },

  components: {
    dirs: [] // Disable auto-importing components
  },

  devtools: { enabled: true },
  modules: [
    // 'nuxt-quasar-ui', 
    '@pinia/nuxt'
  ]
})