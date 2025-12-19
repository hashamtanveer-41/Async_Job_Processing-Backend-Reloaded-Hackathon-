// ===================================
// FILE: src/utils/errors.ts
// ===================================

// 1. Core Status Enums
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// 2. Webhook & Progress Interfaces (Ready for Phases 3 & 4)
export interface WebhookConfig {
  url: string;
  events: string[]; // e.g. ['job.completed']
  secret?: string;
}

export interface JobProgress {
  percent: number;
  message: string;
}

// 3. The Main Job State Interface
// This is exactly what is stored in Motia state
export interface JobState {
  jobId: string;
  status: JobStatus;
  
  // Results & Errors
  result?: string;
  error?: string;
  
  // Future Features (Optional)
  webhookConfig?: WebhookConfig;
  progress?: JobProgress;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// 4. Error Codes
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// 5. Custom Error Classes (Optional but good for clean code)
export class AppError extends Error {
  constructor(
    public code: ErrorCode, 
    message: string, 
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(ErrorCode.JOB_NOT_FOUND, message, 404);
  }
}