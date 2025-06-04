import { ref, createApp, h } from 'vue'
import ReportModal from "../components/ReportModal.vue"
import { useRuntimeConfig } from '#app'
import type { User } from '../types'

// Globálny state pre current user
const currentUser = ref<User | null>(null)

export const useReportModal = () => {
  const config = useRuntimeConfig().public.reportModule

  /**
   * Nastaví user objekt pre reporting
   */
  const setUser = (user: User) => {
    currentUser.value = user
    if (config.debug) {
      console.log('👤 Report Module User set:', {
        id: user.id,
        name: user.name,
        email: user.email
      })
    }
  }

  /**
   * Získa aktuálneho usera
   */
  const getUser = (): User | null => {
    return currentUser.value
  }

  /**
   * Otvorí report modal
   */
  const showModal = (userOverride?: User) => {
    if (typeof window === 'undefined') return

    // Určíme ktorého usera použiť (priorita: override > current > config default)
    const userToUse = userOverride || currentUser.value || config.user || null

    if (!userToUse) {
      console.warn('⚠️ Report Module: No user configured. Please call setUser() or configure default user in nuxt.config.ts')
    }

    if (config.debug) {
      console.log('🚀 Opening Report Modal with user:', userToUse)
    }

    // Vytvoríme modal container
    const container = document.createElement('div')
    container.id = 'report-modal-container'
    document.body.appendChild(container)

    // Vytvoríme Vue app s modalom
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

        // Poskytujeme user objekt do modalu
        return () => h(ReportModal, {
          isOpen: isOpen.value,
          user: userToUse,
          onClose: closeModal
        })
      }
    })

    app.mount(container)
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
