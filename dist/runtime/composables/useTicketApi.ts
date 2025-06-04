import { useApi } from './useApi'

export const useTicketApi = () => {
  const createTicket = async (payload, user) => {
    const ticketData = {
      text: payload.text,
      url: payload.url,
      screenshot: payload.screenshot,
      errors: payload.errors || [],
      userAgent: payload.userAgent,
      user: user
    }

    const { data, error } = await useApi("/tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (error.value) {
      throw error.value
    }

    return data.value
  }

  return {
    createTicket
  }
}
