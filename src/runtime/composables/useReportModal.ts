import { ref, createApp, h } from 'vue';
import ReportModal from '../components/ReportModal.vue';
import type { User, CapturedData, ReportModuleOptions } from '../types';
import { moduleLogger } from '../utils/logger';
import { useCaptureUtils } from './useCaptureUtils';
import { useRuntimeConfig } from '#app';

const currentUser = ref<User | null>(null);

export const useReportModal = () => {
  const runtime = useRuntimeConfig();
  const config = runtime.public.reportModule as ReportModuleOptions;

  const setUser = (user: User): void => {
    currentUser.value = { ...user };

    if (config.debug) {
      moduleLogger.log('👤 Report Module User set:', currentUser.value);
    }
  };

  const getUser = (): User | null => {
    return currentUser.value;
  };

  const createModalApp = (capturedData: CapturedData, userToUse: User) => {
    const container = document.createElement('div');
    container.id = 'report-modal-container';
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const isOpen = ref(true);
        const closeModal = () => {
          isOpen.value = false;
          setTimeout(() => {
            app.unmount();
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
          }, 200);
        };
        return () => h(ReportModal, {
          isOpen: isOpen.value,
          user: userToUse,
          capturedData,
          onClose: closeModal,
        });
      },
    });

    app.mount(container);
    return app;
  };

  const getFallbackCapturedData = (): CapturedData => {
    return {
      url: typeof window !== 'undefined' ? window.location.href : '',
      screenshot: null,
      errors: [],
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      viewport: typeof window !== 'undefined'
        ? { width: window.innerWidth, height: window.innerHeight }
        : null,
      timestamp: Date.now(),
    };
  };

  const showModal = async (): Promise<void> => {
    if (typeof window === 'undefined') {
      return;
    }

    const user = currentUser.value;
    if (!user) {
      moduleLogger.warn('⚠️ User not set. Call setUser() before opening modal.');
      return;
    }

    if (config.debug) {
      moduleLogger.log('🚀 Opening Report Modal with user:', user);
      moduleLogger.log('📊 Collecting captured data...');
    }

    const { getCapturedData } = useCaptureUtils();

    try {
      const capturedData = await getCapturedData();

      if (config.debug) {
        moduleLogger.log('✅ Data capture completed:', capturedData);
      }

      createModalApp(capturedData, user);
    }
    catch (err: unknown) {
      if (config.debug) {
        moduleLogger.warn('⚠️ Data capture failed, using fallback:', err);
      }

      const fallbackData = getFallbackCapturedData();
      createModalApp(fallbackData, user);
    }
  };

  const clearUser = (): void => {
    currentUser.value = null;
    if (config.debug) {
      moduleLogger.log('👤 Report Module User cleared');
    }
  };

  return { showModal, setUser, getUser, clearUser };
};
