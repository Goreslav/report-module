export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-05-26',

  reportModule: {
    apiKey: 'playground-test-key-123',
    apiUrl: 'http://localhost:3334/api',
    debug: true,
  },
});
