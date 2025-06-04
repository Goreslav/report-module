import { useApi } from './useApi'
import type { TicketPayload, TicketResponse, FileUploadResponse } from '../types'

export const useTicketApi = () => {
  const uploadFile = async (file: File, internalId: string): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data, error } = await useApi("/upload-file", {
      method: "POST",
      body: formData,
      key: internalId
    });

    if (error.value) {
      throw error.value;
    }

    return data.value as FileUploadResponse;
  };

  const deleteTempFile = async (fileId: string): Promise<boolean> => {
    const { data, error } = await useApi(`/temp-file/${fileId}`, {
      method: "DELETE",
    });

    if (error.value) {
      throw error.value;
    }

    return data.value;
  };

  const createTicket = async (payload: TicketPayload): Promise<TicketResponse> => {
    const { fileIds = [], ...dataFields } = payload;

    const formData = new FormData();
    Object.entries(dataFields).forEach(([key, value]) => {
      if (value != null) {
        formData.append(key, String(value));
      }
    });
    fileIds.forEach((id, index) => {
      formData.append(`fileIds[${index}]`, id);
    });

    const { data, error } = await useApi("/tickets", {
      method: "POST",
      body: formData,
    });

    if (error.value) {
      throw error.value;
    }

    return data.value as TicketResponse;
  };

  return {
    uploadFile,
    deleteTempFile,
    createTicket,
  };
};
