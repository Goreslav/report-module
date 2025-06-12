// types/global.d.ts

interface Window {
  _reportModuleErrorCaptureInitialized?: boolean
  _reportModuleCapturedErrors?: CapturedError[]
  _reportModuleOriginalConsoleError?: typeof console.error
  _reportModuleOriginalConsoleWarn?: typeof console.warn
  html2canvas?: (element: HTMLElement, options?: Html2CanvasOptions) => Promise<HTMLCanvasElement>
}

interface CapturedError {
  type: 'console-error' | 'console-warn' | 'javascript-error' | 'promise-rejection'
  content: string
  filename?: string
  lineno?: number
  colno?: number
  stack?: string
  timestamp?: number
}

interface Html2CanvasOptions {
  allowTaint?: boolean
  useCORS?: boolean
  scale?: number
  width?: number
  height?: number
}

declare module '#app' {
  interface RuntimeConfig {
    public: {
      reportModule: {
        apiUrl: string
        apiKey: string
        user: User | null
        debug: boolean
      }
    }
  }
}

export {}
