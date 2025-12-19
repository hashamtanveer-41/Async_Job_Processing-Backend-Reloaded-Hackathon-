/*import { z } from 'zod';
import { WebhookConfig } from './webhook';

// ADD new error code (around line 10)
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_JOB_ID = 'INVALID_JOB_ID',
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',  // ← ADD THIS
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  AI_TIMEOUT = 'AI_TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// ADD new error class (around line 40)
export class RateLimitError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, details);
    this.name = 'RateLimitError';
  }
}
export class AppError extends Error {
    constructor(
        public code: ErrorCode,
        public message: string,
        public statusCode: number,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(ErrorCode.INVALID_INPUT, message, 400, details);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, details?: any) {
        super(ErrorCode.JOB_NOT_FOUND, message, 404, details);
        this.name = 'NotFoundError';
    }
}

export class ProcessingError extends AppError {
    constructor(message: string, details?: any) {
        super(ErrorCode.PROCESSING_FAILED, message, 500, details);
        this.name = 'ProcessingError';
    }
}

export interface ErrorResponse {
    error: {
        code: ErrorCode;
        message: string;
        details?: any;
        timestamp: string;
    };
}

export function formatErrorResponse(error: unknown): ErrorResponse {
    const timestamp = new Date().toISOString();

    if (error instanceof AppError) {
        return {
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
                timestamp,
            },
        };
    }

    if (error instanceof z.ZodError) {
        return {
            error: {
                code: ErrorCode.INVALID_INPUT,
                message: 'Validation failed',
                details: error.issues.map((e: z.ZodIssue) => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
                timestamp,
            },
        };
    }
    // ADD this interface to existing file (around line 80)
export interface JobState {
  jobId: string;
  status: JobStatus;
  webhookConfig?: WebhookConfig;  // ← ADD THIS LINE
  result?: string;
  progress?: JobProgress;
  //error?: { /* ...*/   
  /*
  createdAt: string;
  updatedAt: string;
}
    return {
        error: {
            code: ErrorCode.UNKNOWN_ERROR,
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
            timestamp,
        },
    };
}

export enum JobStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export interface JobState {
    jobId: string;
    status: JobStatus;
    result?: string;
    error?: {
        code: ErrorCode;
        message: string;
        details?: any;
        occurredAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

export class ErrorHandler {
    static async wrap<T>(
        fn: () => Promise<T>,
        errorMessage: string
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new ProcessingError(errorMessage, {
                originalError: error instanceof Error ? error.message : String(error),
            });
        }
    }

    static validateJobId(jobId: string): void {
        if (!jobId || typeof jobId !== 'string' || jobId.length < 5) {
            throw new ValidationError('Invalid job ID format', { jobId });
        }
    }

    static async getJobOrThrow(
        jobId: string,
        getJob: (id: string) => Promise<JobState | null>
    ): Promise<JobState> {
        this.validateJobId(jobId);

        const job = await getJob(jobId);

        if (!job) {
            throw new NotFoundError(`Job with ID '${jobId}' not found`, { jobId });
        }

        return job;
    }

    static async markJobAsFailed(
        jobId: string,
        error: unknown,
        updateJob: (id: string, state: Partial<JobState>) => Promise<void>
    ): Promise<void> {
        const errorResponse = formatErrorResponse(error);

        await updateJob(jobId, {
            status: JobStatus.FAILED,
            error: {
                code: errorResponse.error.code,
                message: errorResponse.error.message,
                details: errorResponse.error.details,
                occurredAt: errorResponse.error.timestamp,
            },
            updatedAt: new Date().toISOString(),
        });
    }
}*/

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