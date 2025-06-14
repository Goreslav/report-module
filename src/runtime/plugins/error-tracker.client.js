import { useCaptureUtils } from '../composables/useCaptureUtils';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    const { startErrorTracking } = useCaptureUtils();
    startErrorTracking();
  }
});
