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

  //THE RETRY LOOP
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      //SIGNAL CHECK 1: Start of loop
      let current = (await state.get('ai-jobs', jobId)) as any;
      if (current.status === 'cancelled') {
          logger.warn('Job was cancelled by user. Stopping worker.', { jobId });
          return;
      }
      

      const startTime = Date.now();

      // Update State
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
      //SIGNAL CHECK 2
      current = (await state.get('ai-jobs', jobId));
      if (current.status === 'cancelled') {
          logger.warn('Job cancelled mid-execution.', { jobId });
          return; 
      }
      // CHAOS MODE (Simulate Risk)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      if (attempt === 1 && Math.random() < 0.5) {
          throw new Error('AI Service Busy (Simulated Failure)');
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await state.set('ai-jobs', jobId, {
        ...current,
        status: 'Processing.... Just half left',
        progress: { percent: 50, message: 'Generating output...' },
        updatedAt: new Date().toISOString(),
      });
      
      await new Promise((resolve) => setTimeout(resolve, 2000));


      const duration = Date.now() - startTime;
      await state.set('ai-jobs', jobId, {
        ...current,
        status: 'Completed ',
        progress: { percent: 100, message: 'Done' },
        result: `Processed: "${prompt}" (Succeeded on attempt ${attempt})`,
        updatedAt: new Date().toISOString(),
      });
      
      logger.info('Job Succeeded', { jobId, attempt });
      return; 
    } catch (error: any) {
      logger.warn(`Attempt ${attempt} failed`, { jobId, error: error.message });

    
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
};