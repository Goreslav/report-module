export interface User {
  ma: number;
  name: string;
  level: string;
}

export interface ReportModuleOptions {
  apiKey: string;
  apiUrl: string;
  user?: User;
  debug?: boolean;
}

export interface TicketPayload {
  text: string;
  url: string;
  screenshot?: string | null;
  errors?: CapturedError[];
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  } | null;
  timestamp?: number;
  source?: string;
}

export interface TicketResponse {
  success: boolean;
  ticketNumber: string | number;
  message?: string;
  data?: {
    id: number;
    ticketNumber: string;
    status: string;
  };
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

// Zlepšené API response type bez any
export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface UploadedFile {
  fileId: string;
  fileName: string;
  filePath: string;
  id: number;
}

export interface InvalidFileInternal {
  internalId: string;
  file: File;
  errorMessage: string;
}

export interface UploadingFileInternal {
  internalId: string;
  file: File;
}

export interface CapturedData {
  url: string;
  userAgent: string;
  errors: CapturedError[];
  viewport: {
    width: number;
    height: number;
  } | null;
  screenshot: string | null;
  timestamp: number;
}

export interface CapturedError {
  type: 'console-error' | 'console-warn' | 'javascript-error' | 'promise-rejection';
  content: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: number;
}

// Utility types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Typed API options namiesto any
export interface ApiOptions {
  method?: ApiMethod;
  body?: string | FormData | Record<string, unknown> | null;
  headers?: Record<string, string>;
  timeout?: number;
}
