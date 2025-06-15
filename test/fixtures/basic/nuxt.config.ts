import MyModule from '../../../src/module';

export default defineNuxtConfig({
  modules: [
    // vložíme ho spolu s configom
    [MyModule, {
      apiKey: 'fake-key-for-test',
      apiUrl: 'http://localhost',
      debug: false,
    }],
  ],
});
