import { ref } from 'vue'
import html2canvas from 'html2canvas'
import type { CapturedError, CapturedData } from '../types'

const capturedErrors = ref<CapturedError[]>([])

export const useCaptureUtils = () => {
  const startErrorTracking = () => {
    if (typeof window === 'undefined') return
    if (window._reportModuleErrorCaptureInitialized) return
    window._reportModuleErrorCaptureInitialized = true

    window._reportModuleCapturedErrors = window._reportModuleCapturedErrors || []
    window._reportModuleOriginalConsoleError = console.error

    console.error = function (...args: any[]) {
      const errorData: CapturedError = {
        type: 'console-error',
        content: args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
        timestamp: Date.now()
      }

      window._reportModuleCapturedErrors?.push(errorData)
      capturedErrors.value.push(errorData)
      window._reportModuleOriginalConsoleError?.apply(console, args)
    }

    window._reportModuleOriginalConsoleWarn = console.warn
    console.warn = function (...args: any[]) {
      const warnData: CapturedError = {
        type: 'console-warn',
        content: args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
        timestamp: Date.now()
      }

      window._reportModuleCapturedErrors?.push(warnData)
      capturedErrors.value.push(warnData)
      window._reportModuleOriginalConsoleWarn?.apply(console, args)
    }

    window.addEventListener('error', function (event: ErrorEvent) {
      const errorData: CapturedError = {
        type: 'javascript-error',
        content: 'Uncaught error: ' + (event.error ? event.error.message : event.message),
        filename: event.filename || 'unknown',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        stack: event.error?.stack || 'No stack trace',
        timestamp: Date.now()
      }

      window._reportModuleCapturedErrors?.push(errorData)
      capturedErrors.value.push(errorData)
    })

    window.addEventListener('unhandledrejection', function (event: PromiseRejectionEvent) {
      const errorData: CapturedError = {
        type: 'promise-rejection',
        content: 'Unhandled Promise rejection: ' + (
          event.reason ? (event.reason.message || String(event.reason)) : 'Unknown'
        ),
        stack: event.reason?.stack || 'No stack trace',
        timestamp: Date.now()
      }

      window._reportModuleCapturedErrors?.push(errorData)
      capturedErrors.value.push(errorData)
    })
  }

  const captureScreenshot = async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null

    try {
      // Pokus s html2canvas
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        scale: 0.5,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        removeContainer: true
      })

      const dataURL = canvas.toDataURL('image/jpeg', 0.7)
      return dataURL

    } catch (error) {
      console.warn('html2canvas failed, creating fallback screenshot:', error)

      try {
        // Fallback - vytvorenie placeholder screenshotu
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) return null

        canvas.width = 800
        canvas.height = 600

        // Gradient pozadie
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#f3f4f6')
        gradient.addColorStop(1, '#e5e7eb')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Header
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('Report Module Screenshot', 20, 40)

        // Informácie o stránke
        ctx.font = '16px Arial'
        ctx.fillStyle = '#6b7280'

        const lines = [
          `URL: ${window.location.href}`,
          `Viewport: ${window.innerWidth}x${window.innerHeight}`,
          `User Agent: ${navigator.userAgent.substring(0, 80)}...`,
          `Timestamp: ${new Date().toLocaleString()}`,
          '',
          'Note: Full page screenshot unavailable.',
          'This is a fallback capture with page metadata.'
        ]

        lines.forEach((line, index) => {
          const y = 80 + (index * 25)
          if (y < canvas.height - 30) {
            ctx.fillText(line, 20, y)
          }
        })

        // Border
        ctx.strokeStyle = '#9ca3af'
        ctx.lineWidth = 2
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

        // Status indikátor
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc(canvas.width - 30, 30, 8, 0, 2 * Math.PI)
        ctx.fill()

        const dataURL = canvas.toDataURL('image/png')
        return dataURL

      } catch (fallbackError) {
        console.error('Fallback screenshot creation failed:', fallbackError)
        return null
      }
    }
  }

  const getCapturedData = async (): Promise<CapturedData> => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''

    // Combine a deduplicate errors
    const allErrors = [
      ...capturedErrors.value,
      ...(window._reportModuleCapturedErrors || [])
    ]

    const uniqueErrors = allErrors.filter((error, index, self) =>
        index === self.findIndex(e =>
          e.type === error.type &&
          e.content === error.content &&
          e.timestamp === error.timestamp
        )
    )

    const data: CapturedData = {
      url,
      userAgent,
      errors: uniqueErrors,
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : null,
      screenshot: null,
      timestamp: Date.now()
    }

    try {
      console.log('📸 Capturing screenshot...')
      data.screenshot = await captureScreenshot()

      if (data.screenshot) {
        console.log('✅ Screenshot captured successfully')
      } else {
        console.warn('⚠️ Screenshot capture returned null')
      }
    } catch (error) {
      console.error('❌ Screenshot capture failed:', error)
      data.screenshot = null
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

    // Restore original console methods
    if (window._reportModuleOriginalConsoleError) {
      console.error = window._reportModuleOriginalConsoleError
      delete window._reportModuleOriginalConsoleError
    }

    if (window._reportModuleOriginalConsoleWarn) {
      console.warn = window._reportModuleOriginalConsoleWarn
      delete window._reportModuleOriginalConsoleWarn
    }

    // Clean up global state
    if (window._reportModuleCapturedErrors) {
      delete window._reportModuleCapturedErrors
    }

    window._reportModuleErrorCaptureInitialized = false
  }

  const getErrorCount = (): number => {
    return capturedErrors.value.length + (window._reportModuleCapturedErrors?.length || 0)
  }

  const getLastError = (): CapturedError | null => {
    const allErrors = [
      ...capturedErrors.value,
      ...(window._reportModuleCapturedErrors || [])
    ]

    if (allErrors.length === 0) return null

    return allErrors.sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  return {
    startErrorTracking,
    stopErrorTracking,
    captureScreenshot,
    getCapturedData,
    clearCapturedErrors,
    getErrorCount,
    getLastError,
    capturedErrors: capturedErrors.value
  }
}
