export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface WebhookConfig {
  url: string;
  events: string[]; 
  secret?: string;
}

export interface JobProgress {
  percent: number;
  message: string;
}

export interface JobState {
  jobId: string;
  status: JobStatus;
  result?: string;
  error?: string;
  webhookConfig?: WebhookConfig;
  progress?: JobProgress;
  createdAt: string;
  updatedAt: string;
}
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
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