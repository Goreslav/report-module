import { ref, createApp, h } from 'vue'
import ReportModal from "../components/ReportModal.vue"
import { useRuntimeConfig } from '#app'
import { useCaptureUtils } from './useCaptureUtils'

// Globálny state pre current user
const currentUser = ref(null)

export const useReportModal = () => {
  const config = useRuntimeConfig().public.reportModule

  /**
   * Nastaví user objekt pre reporting
   */
  const setUser = (user) => {
    // Validácia user objektu
    if (!user || typeof user !== 'object') {
      console.warn('⚠️ Report Module: Invalid user object')
      return
    }

    // Validácia povinných polí
    if (!user.meno || typeof user.meno !== 'string') {
      console.warn('⚠️ Report Module: user.meno (string) is required')
      return
    }

    if (!user.ma || typeof user.ma !== 'number') {
      console.warn('⚠️ Report Module: user.ma (number) is required')
      return
    }

    if (!user.level || typeof user.level !== 'string') {
      console.warn('⚠️ Report Module: user.level (string) is required')
      return
    }

    currentUser.value = {
      meno: user.meno,
      ma: user.ma,
      level: user.level,
      // Dodatočné fields ak existujú
      ...user
    }

    if (config.debug) {
      console.log('👤 Report Module User set:', {
        meno: user.meno,
        ma: user.ma,
        level: user.level
      })
    }
  }

  /**
   * Získa aktuálneho usera
   */
  const getUser = () => {
    return currentUser.value
  }

  /**
   * Otvorí report modal s automatickým zachytením dát
   */
  const showModal = async (userOverride) => {
    if (typeof window === 'undefined') return

    // Error tracking už beží, len získame utils
    const { getCapturedData } = useCaptureUtils()

    // Určíme ktorého usera použiť
    const userToUse = userOverride || currentUser.value || null

    if (!userToUse) {
      console.warn('⚠️ Report Module: No user configured. Please call setUser() first')
      return
    }

    // Validácia user objektu
    if (!userToUse.meno || !userToUse.ma || !userToUse.level) {
      console.warn('⚠️ Report Module: User must have meno (string), ma (number), and level (string)')
      return
    }

    if (config.debug) {
      console.log('🚀 Opening Report Modal with user:', userToUse)
      console.log('📊 Collecting captured data...')
    }

    try {
      // Zachyť všetky dáta (errors už sú zbierané od načítania stránky)
      const capturedData = await getCapturedData()

      if (config.debug) {
        console.log('✅ Data capture completed:', capturedData)
      }

      // Vytvor modal container
      const container = document.createElement('div')
      container.id = 'report-modal-container'
      document.body.appendChild(container)

      // Vytvor Vue app s modalom
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

          // Poskytni user objekt a captured data do modalu
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
      console.error('❌ Failed to capture data:', error)

      // Otvor modal aj bez captured data
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

  /**
   * Reset user objektu
   */
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
