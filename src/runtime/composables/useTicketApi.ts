import { useApi } from './useApi'

export const useTicketApi = () => {
  const createTicket = async (payload, user) => {
    // Vytvoríme kompletný ticket objekt BEZ timestampov a source
    const ticketData = {
      text: payload.text, // Povinný text field
      url: payload.url, // URL kde bol modal otvorený
      screenshot: payload.screenshot, // Base64 screenshot
      errors: payload.errors || [], // Console errors BEZ timestampov
      userAgent: payload.userAgent,
      user: user // User objekt s meno, ma, level
    }

    // JSON API volanie
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
