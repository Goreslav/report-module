import { ref, createApp, h } from 'vue';
import ReportModal from '../components/ReportModal.vue';
import type { User, CapturedData } from '../types';
import { useCaptureUtils } from './useCaptureUtils';
import { useRuntimeConfig } from '#app';

const currentUser = ref<User | null>(null);

export const useReportModal = () => {
  const config = useRuntimeConfig().public.reportModule;

  const setUser = (user: User) => {
    if (!user || typeof user !== 'object') {
      return;
    }

    if (!user.name || typeof user.name !== 'string') {
      return;
    }

    if (!user.ma || typeof user.ma !== 'number') {
      return;
    }

    if (!user.level || typeof user.level !== 'string') {
      return;
    }

    currentUser.value = {
      name: user.name,
      ma: user.ma,
      level: user.level,
    };

    if (config.debug) {
      console.log('👤 Report Module User set:', {
        name: user.name,
        ma: user.ma,
        level: user.level,
      });
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
          capturedData: capturedData,
          onClose: closeModal,
        });
      },
    });

    app.mount(container);
    return app;
  };

  const getFallbackCapturedData = (): CapturedData => ({
    url: typeof window !== 'undefined' ? window.location.href : '',
    screenshot: null,
    errors: [],
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    viewport: typeof window !== 'undefined'
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
        }
      : null,
    timestamp: Date.now(),
  });

  const showModal = async () => {
    if (typeof window === 'undefined') return;

    const userToUse: User | null = currentUser.value;

    if (!userToUse) {
      console.warn('⚠️ User not set. Call setUser() before opening modal.');
      return;
    }

    if (!userToUse.name || !userToUse.ma || !userToUse.level) {
      console.warn('⚠️ User data incomplete:', userToUse);
      return;
    }

    if (config.debug) {
      console.log('🚀 Opening Report Modal with user:', userToUse);
      console.log('📊 Collecting captured data...');
    }

    const { getCapturedData } = useCaptureUtils();

    try {
      const capturedData = await getCapturedData();

      if (config.debug) {
        console.log('✅ Data capture completed:', capturedData);
      }

      createModalApp(capturedData, userToUse);
    }
    catch (error) {
      console.warn('⚠️ Data capture failed, using fallback:', error);

      const fallbackData = getFallbackCapturedData();
      createModalApp(fallbackData, userToUse);
    }
  };

  const clearUser = () => {
    currentUser.value = null;
    if (config.debug) {
      console.log('👤 Report Module User cleared');
    }
  };

  return {
    showModal,
    setUser,
    getUser,
    clearUser,
  };
};
