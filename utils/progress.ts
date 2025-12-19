// Complete utility for tracking job progress
export interface JobProgress {
  currentStep: string;
  percentComplete: number;
  estimatedTimeRemaining?: number;
  stages: JobStage[];
}

export interface JobStage {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
}

export class ProgressTracker {
  // Methods for updating progress
}