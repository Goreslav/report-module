import type { User, TicketPayload, TicketResponse } from '../types';
import { useApi } from './useApi';

export const useTicketApi = () => {
  const createTicket = async (
    payload: TicketPayload,
    user: User,
  ): Promise<TicketResponse> => {
    const ticketData = {
      text: payload.text,
      url: payload.url,
      screenshot: payload.screenshot,
      errors: payload.errors ?? [],
      userAgent: payload.userAgent,
      viewport: payload.viewport,
      timestamp: payload.timestamp,
      source: payload.source,
      user,
    };

    const { data, error } = await useApi<TicketResponse>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error.value) {
      throw error.value;
    }

    return data.value as TicketResponse;
  };

  return {
    createTicket,
  };
};
