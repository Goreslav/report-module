import { ref } from 'vue'

// Globálny error tracker
const capturedErrors = ref([])

export const useCaptureUtils = () => {
  /**
   * Inicializuje error tracking
   */
  const startErrorTracking = () => {
    if (typeof window === 'undefined') return

    // Ak už je inicializované, nepridávaj znovu
    if (window._reportModuleErrorCaptureInitialized) return
    window._reportModuleErrorCaptureInitialized = true

    // Inicializuj globálne arrays
    window._reportModuleCapturedErrors = window._reportModuleCapturedErrors || []
    window._reportModuleOriginalConsoleError = console.error

    // Override console.error
    console.error = function () {
      const errorData = {
        type: 'console-error',
        content: Array.from(arguments).map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
      }

      window._reportModuleCapturedErrors.push(errorData)
      capturedErrors.value.push(errorData)

      // Volaj originálnu console.error
      window._reportModuleOriginalConsoleError.apply(console, arguments)
    }

    // Override console.warn
    window._reportModuleOriginalConsoleWarn = console.warn
    console.warn = function () {
      const warnData = {
        type: 'console-warn',
        content: Array.from(arguments).map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
      }

      window._reportModuleCapturedErrors.push(warnData)
      capturedErrors.value.push(warnData)

      // Volaj originálnu console.warn
      window._reportModuleOriginalConsoleWarn.apply(console, arguments)
    }

    // Zachyť JavaScript runtime errors
    window.addEventListener('error', function (event) {
      const errorData = {
        type: 'javascript-error',
        content: 'Uncaught error: ' + (event.error ? event.error.message : event.message),
        filename: event.filename || 'unknown',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        stack: event.error?.stack || 'No stack trace'
      }

      window._reportModuleCapturedErrors.push(errorData)
      capturedErrors.value.push(errorData)
    })

    // Zachyť unhandled promise rejections
    window.addEventListener('unhandledrejection', function (event) {
      const errorData = {
        type: 'promise-rejection',
        content: 'Unhandled Promise rejection: ' + (
          event.reason ? (event.reason.message || String(event.reason)) : 'Unknown'
        ),
        stack: event.reason?.stack || 'No stack trace'
      }

      window._reportModuleCapturedErrors.push(errorData)
      capturedErrors.value.push(errorData)
    })

    console.log('🔍 Report Module: Error capture initialized')
  }

  /**
   * Vytvorí screenshot stránky
   */
  const captureScreenshot = async () => {
    if (typeof window === 'undefined') return null

    try {
      console.log('📸 Capturing screenshot...')

      // Skús html2canvas ak je dostupný
      if (typeof window.html2canvas !== 'undefined') {
        const canvas = await window.html2canvas(document.body, {
          allowTaint: true,
          useCORS: true,
          scale: 0.5,
          width: window.innerWidth,
          height: window.innerHeight
        })

        const dataURL = canvas.toDataURL('image/jpeg', 0.7)
        console.log('✅ Screenshot captured with html2canvas')
        return dataURL
      }

      // Fallback - jednoduchý placeholder
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = 800
      canvas.height = 600

      // Gradient pozadie
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Pridaj informácie
      ctx.fillStyle = '#374151'
      ctx.font = 'bold 24px Arial'
      ctx.fillText('Report Module Screenshot', 20, 40)

      ctx.font = '16px Arial'
      ctx.fillText('URL: ' + window.location.href, 20, 80)
      ctx.fillText('Viewport: ' + window.innerWidth + 'x' + window.innerHeight, 20, 110)
      ctx.fillText('User Agent: ' + navigator.userAgent.substring(0, 80) + '...', 20, 140)

      // Pridaj nejaké vizuálne elementy
      ctx.strokeStyle = '#9ca3af'
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

      const dataURL = canvas.toDataURL('image/png')
      console.log('✅ Screenshot captured (placeholder)')
      return dataURL

    } catch (error) {
      console.warn('❌ Screenshot capture failed:', error)
      return null
    }
  }

  /**
   * Získa všetky zachytené dáta - BEZ timestampov
   */
  const getCapturedData = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''

    console.log('📊 Collecting captured data...')

    // Spojíme errors z reactive ref a z window (pre istotu)
    const allErrors = [
      ...capturedErrors.value,
      ...(window._reportModuleCapturedErrors || [])
    ]

    // Deduplikuj errors na základe typu a obsahu
    const uniqueErrors = allErrors.filter((error, index, self) =>
      index === self.findIndex(e => e.type === error.type && e.content === error.content)
    )

    const data = {
      url,
      userAgent,
      errors: uniqueErrors, // Bez timestampov
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : null,
      screenshot: null
    }

    // Zachyť screenshot
    try {
      data.screenshot = await captureScreenshot()
    } catch (error) {
      console.warn('Screenshot capture failed:', error)
    }

    console.log('✅ Captured data collected:', {
      url: data.url,
      errorsCount: data.errors.length,
      hasScreenshot: !!data.screenshot,
      screenshotSize: data.screenshot ? Math.round(data.screenshot.length / 1024) + 'KB' : 'N/A'
    })

    // Debug - ukáž errors
    if (data.errors.length > 0) {
      console.log('🚨 Captured errors:', data.errors)
    }

    return data
  }

  /**
   * Vyčistí zachytené errors
   */
  const clearCapturedErrors = () => {
    capturedErrors.value = []
    if (window._reportModuleCapturedErrors) {
      window._reportModuleCapturedErrors = []
    }
    console.log('🧹 Captured errors cleared')
  }

  /**
   * Zastaví error tracking
   */
  const stopErrorTracking = () => {
    if (typeof window === 'undefined') return

    // Obnov originálne funkcie
    if (window._reportModuleOriginalConsoleError) {
      console.error = window._reportModuleOriginalConsoleError
    }
    if (window._reportModuleOriginalConsoleWarn) {
      console.warn = window._reportModuleOriginalConsoleWarn
    }

    window._reportModuleErrorCaptureInitialized = false
    console.log('🛑 Error tracking stopped')
  }

  return {
    startErrorTracking,
    stopErrorTracking,
    captureScreenshot,
    getCapturedData,
    clearCapturedErrors,
    capturedErrors: capturedErrors.value
  }
}
