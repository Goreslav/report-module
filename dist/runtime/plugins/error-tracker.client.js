import { defineNuxtPlugin } from '#app'
import { useCaptureUtils } from '../composables/useCaptureUtils'

export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    const { startErrorTracking } = useCaptureUtils()
    startErrorTracking()

    console.log('🔍 Report Module: Error tracking started automatically on page load')
  }
})
