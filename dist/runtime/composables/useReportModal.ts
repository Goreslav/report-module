import { ref, createApp, h } from 'vue'
import ReportModal from "../components/ReportModal.vue"
import { useRuntimeConfig } from '#app'
import { useCaptureUtils } from './useCaptureUtils'
import {User} from "../types";

const currentUser = ref(null)

export const useReportModal = () => {
  const config = useRuntimeConfig().public.reportModule

  const setUser = (user:User) => {
    if (!user || typeof user !== 'object') {
      return
    }

    if (!user.name || typeof user.name !== 'string') {
      return
    }

    if (!user.ma || typeof user.ma !== 'number') {
      return
    }

    if (!user.level || typeof user.level !== 'string') {
      return
    }

    currentUser.value = {
      name: user.name,
      ma: user.ma,
      level: user.level,
    }

    if (config.debug) {
      console.log('👤 Report Module User set:', {
        name: user.name,
        ma: user.ma,
        level: user.level
      })
    }
  }

  const getUser = () => {
    return currentUser.value
  }

  const showModal = async () => {
    if (typeof window === 'undefined') return
    const { getCapturedData } = useCaptureUtils()

    const userToUse: User = currentUser.value || null

    if (!userToUse) {
      return
    }

    if (!userToUse.name || !userToUse.ma || !userToUse.level) {
      return
    }

    if (config.debug) {
      console.log('🚀 Opening Report Modal with user:', userToUse)
      console.log('📊 Collecting captured data...')
    }

    try {
      const capturedData = await getCapturedData()

      if (config.debug) {
        console.log('✅ Data capture completed:', capturedData)
      }

      const container = document.createElement('div')
      container.id = 'report-modal-container'
      document.body.appendChild(container)

      const app = createApp({
        setup() {
          const isOpen = ref(true)

          const closeModal = () => {
            isOpen.value = false
            setTimeout(() => {
              app.unmount()
              if (document.body.contains(container)) {
                document.body.removeChild(container)
              }
            }, 200)
          }
          return () => h(ReportModal, {
            isOpen: isOpen.value,
            user: userToUse,
            capturedData: capturedData,
            onClose: closeModal
          })
        }
      })

      app.mount(container)

    } catch (error) {
      const container = document.createElement('div')
      container.id = 'report-modal-container'
      document.body.appendChild(container)
      const app = createApp({
        setup() {
          const isOpen = ref(true)

          const closeModal = () => {
            isOpen.value = false
            setTimeout(() => {
              app.unmount()
              if (document.body.contains(container)) {
                document.body.removeChild(container)
              }
            }, 200)
          }

          return () => h(ReportModal, {
            isOpen: isOpen.value,
            user: userToUse,
            capturedData: {
              url: window.location.href,
              screenshot: null,
              errors: [],
              userAgent: navigator.userAgent
            },
            onClose: closeModal
          })
        }
      })

      app.mount(container)
    }
  }
  const clearUser = () => {
    currentUser.value = null
    if (config.debug) {
      console.log('👤 Report Module User cleared')
    }
  }

  return {
    showModal,
    setUser,
    getUser,
    clearUser
  }
}
