export interface ReportModuleOptions {
  apiUrl?: string
  debug?: boolean
}

export interface TicketPayload {
  formType: string;
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
}

export enum SelectBoxType {
  PRODUCTION = 'production',
  PROTOCOLS = 'protocols',
  PORTAL_AERO = 'portal_aero',
  MY_COMPANY = 'my_company',
  ORANGE_EMAILS = 'orange_emails',
  OTHER = 'other'
}

export interface BoxItem {
  iconName: string;
  text: string;
  type: SelectBoxType;
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
}
