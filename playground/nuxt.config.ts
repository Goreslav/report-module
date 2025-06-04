export default defineNuxtConfig({
  modules: ['../src/module'],

  reportModule: {
    apiKey: 'playground-test-key-123',
    apiUrl: 'http://localhost:3334/api',
    debug: true
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-05-26',
  css: ['~/assets/css/main.css']
})
