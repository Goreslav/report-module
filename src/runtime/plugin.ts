import { moduleLogger } from './utils/logger';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((_nuxtApp) => {
  moduleLogger.log('Plugin injected by my-module!');
});
