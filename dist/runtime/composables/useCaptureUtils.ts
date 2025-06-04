import { ref } from 'vue'

const capturedErrors = ref([])

export const useCaptureUtils = () => {
  const startErrorTracking = () => {
    if (typeof window === 'undefined') return
    if (window._reportModuleErrorCaptureInitialized) return
    window._reportModuleErrorCaptureInitialized = true

    window._reportModuleCapturedErrors = window._reportModuleCapturedErrors || []
    window._reportModuleOriginalConsoleError = console.error

    console.error = function () {
      const errorData = {
        type: 'console-error',
        content: Array.from(arguments).map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
      }

      window._reportModuleCapturedErrors.push(errorData)
      capturedErrors.value.push(errorData)
      window._reportModuleOriginalConsoleError.apply(console, arguments)
    }

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
      window._reportModuleOriginalConsoleWarn.apply(console, arguments)
    }

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
  }

  const captureScreenshot = async () => {
    if (typeof window === 'undefined') return null

    try {
      if (typeof window.html2canvas !== 'undefined') {
        const canvas = await window.html2canvas(document.body, {
          allowTaint: true,
          useCORS: true,
          scale: 0.5,
          width: window.innerWidth,
          height: window.innerHeight
        })

        const dataURL = canvas.toDataURL('image/jpeg', 0.7)
        return dataURL
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = 800
      canvas.height = 600

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#374151'
      ctx.font = 'bold 24px Arial'
      ctx.fillText('Report Module Screenshot', 20, 40)

      ctx.font = '16px Arial'
      ctx.fillText('URL: ' + window.location.href, 20, 80)
      ctx.fillText('Viewport: ' + window.innerWidth + 'x' + window.innerHeight, 20, 110)
      ctx.fillText('User Agent: ' + navigator.userAgent.substring(0, 80) + '...', 20, 140)

      ctx.strokeStyle = '#9ca3af'
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

      const dataURL = canvas.toDataURL('image/png')
      return dataURL

    } catch (error) {
      return null
    }
  }
  const getCapturedData = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''

    const allErrors = [
      ...capturedErrors.value,
      ...(window._reportModuleCapturedErrors || [])
    ]

    const uniqueErrors = allErrors.filter((error, index, self) =>
      index === self.findIndex(e => e.type === error.type && e.content === error.content)
    )

    const data = {
      url,
      userAgent,
      errors: uniqueErrors,
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : null,
      screenshot: null
    }

    try {
      data.screenshot = await captureScreenshot()
    } catch (error) {
      throw error
    }

    return data
  }

  const clearCapturedErrors = () => {
    capturedErrors.value = []
    if (window._reportModuleCapturedErrors) {
      window._reportModuleCapturedErrors = []
    }
  }

  const stopErrorTracking = () => {
    if (typeof window === 'undefined') return

    if (window._reportModuleOriginalConsoleError) {
      console.error = window._reportModuleOriginalConsoleError
    }
    if (window._reportModuleOriginalConsoleWarn) {
      console.warn = window._reportModuleOriginalConsoleWarn
    }

    window._reportModuleErrorCaptureInitialized = false
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
