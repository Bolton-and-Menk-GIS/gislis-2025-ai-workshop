// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devServer: {
    port: 3050,
  },
  components: {
    dirs: [] // Disable auto-importing components
  },
  devtools: { enabled: true }
})
