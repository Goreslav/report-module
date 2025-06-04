export interface User {
  ma:  number
  name: string
  level: string
}

export interface ReportModuleOptions {
  apiKey: string
  apiUrl: string
  user?: User
  debug?: boolean
}

export interface TicketPayload {
  linkToPage: string
  description: string
  fileIds?: string[]
  reporter?: User
  timestamp?: string
  source?: string
}

export interface TicketResponse {
  success: boolean
  ticketNumber: string | number
  message?: string
}

export interface FileUploadResponse {
  success: boolean
  data: {
    fileId: string
    fileName: string
    filePath: string
    id: number
  }
  message?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface UploadedFile {
  fileId: string
  fileName: string
  filePath: string
  id: number
}

export interface InvalidFileInternal {
  internalId: string
  file: File
  errorMessage: string
}

export interface UploadingFileInternal {
  internalId: string
  file: File
}
