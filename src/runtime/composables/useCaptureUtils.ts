import { ref } from 'vue';
import html2canvas from 'html2canvas';
import type { CapturedError, CapturedData } from '../types';

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
      // 🔍 DEBUG: Analyzujte čo je v DOM
      console.log('=== SCREENSHOT DEBUG ===');

      // Nájdite oblasti s ilustráciami
      const illustrations = document.querySelectorAll('[class*="avatar"], [class*="illustration"], svg, canvas');
      console.log('Found illustrations:', illustrations.length);

      illustrations.forEach((el, index) => {
        console.log(`Element ${index}:`, {
          tagName: el.tagName,
          className: el.className,
          computedStyle: getComputedStyle(el).backgroundImage,
          innerHTML: el.innerHTML?.substring(0, 100) + '...',
          src: el.src || 'no src',
          clientWidth: el.clientWidth,
          clientHeight: el.clientHeight
        });
      });

      // Skontrolujte canvas elementy
      const canvases = document.querySelectorAll('canvas');
      console.log('Canvas elements found:', canvases.length);

      // Skontrolujte background images
      const elementsWithBg = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = getComputedStyle(el);
        return style.backgroundImage !== 'none';
      });
      console.log('Elements with background images:', elementsWithBg.length);

      const canvas = await html2canvas(document.body, {
        scale: 0.9,
        backgroundColor: '#ffffff',
        allowTaint: true,
        useCORS: true,
        foreignObjectRendering: true,
        imageTimeout: 30000,
        logging: true,  // ✅ Zapnúť logging

        onclone: (clonedDoc) => {
          console.log('=== ONCLONE DEBUG ===');

          // Debug klonovaného dokumentu
          const clonedIllustrations = clonedDoc.querySelectorAll('[class*="avatar"], [class*="illustration"], svg, canvas');
          console.log('Cloned illustrations:', clonedIllustrations.length);

          clonedIllustrations.forEach((el, index) => {
            console.log(`Cloned element ${index}:`, {
              tagName: el.tagName,
              className: el.className,
              visibility: getComputedStyle(el).visibility,
              display: getComputedStyle(el).display,
              opacity: getComputedStyle(el).opacity
            });

            // Force visibility
            el.style.visibility = 'visible';
            el.style.display = 'block';
            el.style.opacity = '1';
          });

          return clonedDoc;
        }
      });

      console.log('Canvas created:', {
        width: canvas.width,
        height: canvas.height,
        area: canvas.width * canvas.height
      });

      const dataURL = canvas.toDataURL('image/png', 1.0);
      console.log('DataURL length:', dataURL.length);

      await captureExperimental()
      return dataURL;

    } catch (error) {
      console.error("Screenshot failed:", error);
      return null;
    }
  };


// 🔬 EXPERIMENTÁLNA VERZIA - Rôzne nastavenia
  const captureExperimental = async () => {
    if (typeof window === 'undefined') return null;

    const experiments = [
      // Experiment 1: Bez foreignObjectRendering
      {
        name: 'No foreignObjectRendering',
        options: {
          scale: 0.9,
          allowTaint: true,
          useCORS: true,
          foreignObjectRendering: false
        }
      },

      // Experiment 2: Iný scale
      {
        name: 'Higher scale',
        options: {
          scale: 1.5,
          allowTaint: true,
          useCORS: true,
          foreignObjectRendering: true
        }
      },

      // Experiment 3: Bez CORS
      {
        name: 'No CORS',
        options: {
          scale: 0.9,
          allowTaint: false,
          useCORS: false,
          foreignObjectRendering: true
        }
      }
    ];

    for (const experiment of experiments) {
      try {
        console.log(`Trying: ${experiment.name}`);

        const canvas = await html2canvas(document.body, {
          ...experiment.options,
          backgroundColor: '#ffffff',
          imageTimeout: 10000
        });

        const dataURL = canvas.toDataURL('image/png', 1.0);
        console.log(`${experiment.name} - Success, length:`, dataURL.length);

        return dataURL; // Vráť prvý úspešný

      } catch (error) {
        console.log(`${experiment.name} - Failed:`, error.message);
      }
    }

    return null;
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
      console.log('📸 Capturing screenshot...');
      data.screenshot = await captureScreenshot();

      if (data.screenshot) {
        console.log('✅ Screenshot captured successfully');
      }
      else {
        console.warn('⚠️ Screenshot capture returned null');
      }
    }
    catch (error) {
      console.error('❌ Screenshot capture failed:', error);
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
