import { ref } from 'vue';
import html2canvas from 'html2canvas';
import type { CapturedError, CapturedData } from '../types';
import { moduleLogger } from '../utils/logger';

const capturedErrors = ref<CapturedError[]>([]);

export const useCaptureUtils = () => {
  const startErrorTracking = () => {
    if (typeof window === 'undefined') return;
    if (window._reportModuleErrorCaptureInitialized) return;
    window._reportModuleErrorCaptureInitialized = true;

    window._reportModuleCapturedErrors = window._reportModuleCapturedErrors || [];
    window._reportModuleOriginalConsoleError = console.error;

    console.error = function (...args: any[]) {
      const errorData: CapturedError = {
        type: 'console-error',
        content: args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg),
        ).join(' '),
        timestamp: Date.now(),
      };

      window._reportModuleCapturedErrors?.push(errorData);
      capturedErrors.value.push(errorData);
      window._reportModuleOriginalConsoleError?.apply(console, args);
    };

    window._reportModuleOriginalConsoleWarn = console.warn;
    console.warn = function (...args: any[]) {
      const warnData: CapturedError = {
        type: 'console-warn',
        content: args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg),
        ).join(' '),
        timestamp: Date.now(),
      };

      window._reportModuleCapturedErrors?.push(warnData);
      capturedErrors.value.push(warnData);
      window._reportModuleOriginalConsoleWarn?.apply(console, args);
    };

    window.addEventListener('error', function (event: ErrorEvent) {
      const errorData: CapturedError = {
        type: 'javascript-error',
        content: 'Uncaught error: ' + (event.error ? event.error.message : event.message),
        filename: event.filename || 'unknown',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        stack: event.error?.stack || 'No stack trace',
        timestamp: Date.now(),
      };

      window._reportModuleCapturedErrors?.push(errorData);
      capturedErrors.value.push(errorData);
    });

    window.addEventListener('unhandledrejection', function (event: PromiseRejectionEvent) {
      const errorData: CapturedError = {
        type: 'promise-rejection',
        content: 'Unhandled Promise rejection: ' + (
          event.reason ? (event.reason.message || String(event.reason)) : 'Unknown'
        ),
        stack: event.reason?.stack || 'No stack trace',
        timestamp: Date.now(),
      };

      window._reportModuleCapturedErrors?.push(errorData);
      capturedErrors.value.push(errorData);
    });
  };

  const captureScreenshot = async () => {
    if (typeof window === 'undefined') return null;

    try {

      const canvas = await html2canvas(document.body, {
        scale: 1,
        backgroundColor: '#ffffff',
        allowTaint: true,
        useCORS: true,
        foreignObjectRendering: false,
        imageTimeout: 30000,
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const dataURL = canvas.toDataURL('image/png', 0.9);
      return dataURL;

    } catch (error) {
      moduleLogger.warn("html2canvas failed:", error);
      return null;
    }
  };
  const getCapturedData = async (): Promise<CapturedData> => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

    // Combine a deduplicate errors
    const allErrors = [
      ...capturedErrors.value,
      ...(window._reportModuleCapturedErrors || []),
    ];

    const uniqueErrors = allErrors.filter((error, index, self) =>
      index === self.findIndex(e =>
        e.type === error.type
        && e.content === error.content
        && e.timestamp === error.timestamp,
      ),
    );

    const data: CapturedData = {
      url,
      userAgent,
      errors: uniqueErrors,
      viewport: typeof window !== 'undefined'
        ? {
            width: window.innerWidth,
            height: window.innerHeight,
          }
        : null,
      screenshot: null,
      timestamp: Date.now(),
    };

    try {
      moduleLogger.log('📸 Capturing screenshot...');
      data.screenshot = await captureScreenshot();

      if (data.screenshot) {
        moduleLogger.log('✅ Screenshot captured successfully');
      }
      else {
        moduleLogger.warn('⚠️ Screenshot capture returned null');
      }
    }
    catch (error) {
      moduleLogger.error('❌ Screenshot capture failed:', error);
      data.screenshot = null;
    }

    return data;
  };

  const clearCapturedErrors = () => {
    capturedErrors.value = [];
    if (window._reportModuleCapturedErrors) {
      window._reportModuleCapturedErrors = [];
    }
  };

  const stopErrorTracking = () => {
    if (typeof window === 'undefined') return;

    // Restore original console methods
    if (window._reportModuleOriginalConsoleError) {
      console.error = window._reportModuleOriginalConsoleError;
      delete window._reportModuleOriginalConsoleError;
    }

    if (window._reportModuleOriginalConsoleWarn) {
      console.warn = window._reportModuleOriginalConsoleWarn;
      delete window._reportModuleOriginalConsoleWarn;
    }

    // Clean up global state
    if (window._reportModuleCapturedErrors) {
      delete window._reportModuleCapturedErrors;
    }

    window._reportModuleErrorCaptureInitialized = false;
  };

  const getErrorCount = (): number => {
    return capturedErrors.value.length + (window._reportModuleCapturedErrors?.length || 0);
  };

  const getLastError = (): CapturedError | null => {
    const allErrors = [
      ...capturedErrors.value,
      ...(window._reportModuleCapturedErrors || []),
    ];

    if (allErrors.length === 0) return null;

    return allErrors.sort((a, b) => b.timestamp - a.timestamp)[0];
  };

  return {
    startErrorTracking,
    stopErrorTracking,
    captureScreenshot,
    getCapturedData,
    clearCapturedErrors,
    getErrorCount,
    getLastError,
    capturedErrors: capturedErrors.value,
  };
};
