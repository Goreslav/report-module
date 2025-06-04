import { useCaptureUtils } from '../composables/useCaptureUtils'

export default defineNuxtPlugin(() => {
  // Spusti error tracking hneď pri načítaní stránky
  if (typeof window !== 'undefined') {
    const { startErrorTracking } = useCaptureUtils()
    startErrorTracking()

    console.log('🔍 Report Module: Error tracking started automatically on page load')

    // Odstránené test errors - nebudeme automaticky generovať errory
  }
})
