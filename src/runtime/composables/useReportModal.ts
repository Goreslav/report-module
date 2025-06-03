import { ref, createApp, h } from 'vue'
import ReportModal from "../components/ReportModal.vue"
import { useRuntimeConfig } from '#app'

export const useReportModal = () => {
  const showModal = () => {
    if (typeof window === 'undefined') return

    const config = useRuntimeConfig().public.reportModule
    const apiUrl = config.apiUrl || ''

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
          apiUrl: apiUrl,
          isOpen: isOpen.value,
          onClose: closeModal
        })
      }
    })

    app.mount(container)
  }

  return {
    showModal
  }
}
