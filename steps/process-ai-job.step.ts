// ===================================
// FILE: src/steps/process-ai-job.step.ts
// ===================================

import { EventConfig } from 'motia';
import { JobStatus, JobState } from '../utils/errors';
import { promise } from 'zod';

export const config: EventConfig = {
  name: 'ProcessAIJob',
  type: 'event',
  subscribes: ['ai.job.created'],
  flows: ['ai-jobs'],
  emits: [],
};

export const handler = async (event: any, { state, logger }: any) => {
  // 1. Safe Destructuring
  const { jobId, prompt } = event.data || event;

  logger.info('Processing AI Job', { jobId });

  try {
    // 2. Retrieve State
    const jobState = (await state.get('ai-jobs', jobId)) as JobState;
    if (!jobState) return;

    // 3. Update Status -> PROCESSING
    const startTime = Date.now(); // Start the stopwatch


    await state.set('ai-jobs', jobId, {
      ...jobState,
      status: JobStatus.PROCESSING,
      progress: {percent: 0, message: 'Starting the process....'},
      updatedAt: new Date().toISOString(),
    });

    await new Promise((resolve)=> setTimeout(resolve, 3500));
    
    await state.set('ai-jobs', jobId,{
        ...jobState, 
        status: JobStatus.PROCESSING, 
        progress: { percent: 50, message: 'Prompt is being analyzed...'}, 
        updatedAt: new Date().toISOString,
    });
    logger.info('Job Progress: 50%', { jobId });

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const duration = Date.now()- startTime;
    await state.set('ai-jobs', jobId, {
        ...jobState, 
        status: JobStatus.COMPLETED,
        progress: {percent:100, message: 'Done'},
        result:    `Processed: "${prompt}" in ${duration}ms`,
        updatedAt: new Date().toISOString(), 
    });
    logger.info('Job Completed', {jobId});
    // ---------------------------------------------------------
    // 💥 CHAOS BLOCK: Simulate Real World Failures
    // ---------------------------------------------------------
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
    
    // 30% Chance to Crash
    if (Math.random() < 0.3) {
        throw new Error('AI Provider Timed Out (Simulation)');
    }
    
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3s more
    // ---------------------------------------------------------

    // 4. Update Status -> COMPLETED
    await state.set('ai-jobs', jobId, {
      ...jobState,
      status: JobStatus.COMPLETED,
      result: `Processed: "${prompt}" in ${duration}ms`, // ✨ Added Duration
      updatedAt: new Date().toISOString(),
    });

    logger.info('Job Completed Successfully', { jobId, duration });

  } catch (error: any) {
    logger.error('Job Processing Failed', { jobId, error: error.message });

    // 5. Handle Failure (The Safety Net)
    const currentState = (await state.get('ai-jobs', jobId)) as JobState;
    
    if (currentState) {
      await state.set('ai-jobs', jobId, {
        ...currentState,
        status: JobStatus.FAILED, // <--- This is what we want to see
        error: error.message,     // <--- Save the reason
        updatedAt: new Date().toISOString(),
      });
    }
  }
};