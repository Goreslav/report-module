import { useApi } from './useApi'
import type { TicketPayload, TicketResponse, FileUploadResponse, User } from '../types'

export const useTicketApi = () => {
  const uploadFile = async (file: File, internalId: string): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const { data, error } = await useApi<FileUploadResponse>("/upload-file", {
      method: "POST",
      body: formData,
      key: internalId
    })

    if (error.value) {
      throw error.value
    }

    return data.value
  }

  const deleteTempFile = async (fileId: string): Promise<boolean> => {
    const { data, error } = await useApi<boolean>(`/temp-file/${fileId}`, {
      method: "DELETE",
    })

    if (error.value) {
      throw error.value
    }

    return data.value
  }

  const createTicket = async (payload: TicketPayload, user?: User): Promise<TicketResponse> => {
    const { fileIds = [], ...dataFields } = payload

    // Vytvoríme kompletný ticket objekt s user informáciami
    const ticketData = {
      ...dataFields,
      reporter: user || payload.reporter,
      timestamp: new Date().toISOString(),
      source: 'report-module',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    }

    const formData = new FormData()

    // Pridáme všetky základné fields
    Object.entries(ticketData).forEach(([key, value]) => {
      if (value != null) {
        // Ak je to objekt (reporter), serialize do JSON
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, String(value))
        }
      }
    })

    // Pridáme file IDs
    fileIds.forEach((id, index) => {
      formData.append(`fileIds[${index}]`, id)
    })

    const { data, error } = await useApi<TicketResponse>("/tickets", {
      method: "POST",
      body: formData,
    })

    if (error.value) {
      throw error.value
    }

    return data.value
  }

  return {
    uploadFile,
    deleteTempFile,
    createTicket,
  }
}
