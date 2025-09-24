// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  vite: {
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('calcite-') || tag.startsWith('arcgis-'),
        },
      },
      features: {
        propsDestructure: true,
      },
    },
  },
  css: [
    // In app.vue or a plugin file
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
  modules: [// 'nuxt-quasar-ui', 
    '@pinia/nuxt', 
    [
      "nuxt-openapi-docs-module",
      {
        folder: './docs/openapi',
        name: 'OpenApiDocs'
      }
    ]
  ]
})