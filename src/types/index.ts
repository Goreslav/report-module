export interface TicketPayload {
  formType?: string;
  description: string;
  linkToPage: string;
  reporterMa?: string;
  contractNumber?: string;
  protocolNumber?: string;
  desiredState?: string;
  fileIds?: string[];
}

export interface TicketResponse {
  success: boolean;
  ticketNumber: number;
}

export interface FileUploadResponse {
  success: boolean;
  data: {
    fileId: string;
    fileName: string;
    filePath: string;
    id: number;
  };
  message?: string;
}

export interface ReportModuleOptions {
  apiUrl?: string
  debug?: boolean
}
