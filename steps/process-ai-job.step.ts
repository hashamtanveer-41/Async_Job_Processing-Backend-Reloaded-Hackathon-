// ===================================
// FILE: src/steps/process-ai-job.step.ts
// ===================================

import { EventConfig } from 'motia';
import { JobStatus, JobState } from '../utils/errors';

export const config: EventConfig = {
  name: 'ProcessAIJob',
  type: 'event',
  subscribes: ['ai.job.created'],
  flows: ['ai-jobs'],
  emits: [],
};

export const handler = async (event: any, { state, logger }: any) => {
  const { jobId, prompt } = event.data || event;
  const MAX_RETRIES = 3;

  logger.info('Processing AI Job', { jobId });

  // 🔄 THE RETRY LOOP
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // 🛑 SIGNAL CHECK 1: Start of loop
      let current = (await state.get('ai-jobs', jobId)) as any;
      if (current.status === 'cancelled') {
          logger.warn('Job was cancelled by user. Stopping worker.', { jobId });
          return; // <--- STOP EVERYTHING
      }
      

      const startTime = Date.now();

      // Update State: Processing (Show attempt number!)
      await state.set('ai-jobs', jobId, {
        ...current,
        status: 'processing',
        progress: { 
            percent: 10 * attempt, 
            message: `Attempt ${attempt}: Analyzing...` 
        },
        updatedAt: new Date().toISOString(),
      });
      await new Promise((resolve) => setTimeout(resolve, 20000));
// 🛑 SIGNAL CHECK 2: Mid-work check
      // (This makes the cancellation feel "instant")
      current = (await state.get('ai-jobs', jobId));
      if (current.status === 'cancelled') {
          logger.warn('Job cancelled mid-execution.', { jobId });
          return; // <--- STOP EVERYTHING
      }
      // 💥 CHAOS MODE (Simulate Risk)
      // 50% chance to fail on the first attempt
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      if (attempt === 1 && Math.random() < 0.5) {
          throw new Error('AI Service Busy (Simulated Failure)');
      }

      // If we survive the chaos, simulate work
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update State: Halfway
      await state.set('ai-jobs', jobId, {
        ...current,
        status: 'Processing.... Just half left',
        progress: { percent: 50, message: 'Generating output...' },
        updatedAt: new Date().toISOString(),
      });
      
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // SUCCESS!
      const duration = Date.now() - startTime;
      await state.set('ai-jobs', jobId, {
        ...current,
        status: 'Completed ',
        progress: { percent: 100, message: 'Done' },
        result: `Processed: "${prompt}" (Succeeded on attempt ${attempt})`,
        updatedAt: new Date().toISOString(),
      });
      
      logger.info('Job Succeeded', { jobId, attempt });
      return; // Exit the loop on success

    } catch (error: any) {
      logger.warn(`Attempt ${attempt} failed`, { jobId, error: error.message });

      // If this was the last attempt, give up
      if (attempt === MAX_RETRIES) {
        const currentState = (await state.get('ai-jobs', jobId)) as JobState;
        await state.set('ai-jobs', jobId, {
            ...currentState,
            status: JobStatus.FAILED,
            error: `Permanent Failure: ${error.message}`,
            updatedAt: new Date().toISOString(),
        });
        logger.error('Job Permanently Failed', { jobId });
      } else {
        // Wait before retrying (Backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
};