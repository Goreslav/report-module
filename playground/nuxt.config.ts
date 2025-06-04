export default defineNuxtConfig({
  modules: ['../src/module'],

  reportModule: {
    apiUrl: 'http://localhost:3334',
    debug: true
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-05-26'
})
