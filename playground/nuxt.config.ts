export default defineNuxtConfig({
  modules: ['../src/module'],

  reportModule: {
    apiUrl: 'https://api.example.com',
    debug: true
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-05-26'
})
