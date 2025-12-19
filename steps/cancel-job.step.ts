// ===================================
// FILE: src/steps/cancel-job.step.ts
// ===================================
import { ApiRouteConfig } from 'motia';
import { z } from 'zod';
import { JobState, JobStatus } from '../utils/errors';

export const config: ApiRouteConfig = {
  name: 'CancelAIJob',
  type: 'api',          // ✅ FIXED: Must be 'api'
  path: '/ai/cancel', 
  method: 'POST',
  flows: ['ai-jobs'],
  emits: [],            // ✅ FIXED: Added missing emits
};

const cancelSchema = z.object({
  jobId: z.string(),
});

// ✅ FIXED: Removed ": Handlers['CancelAIJob']" to stop the ghost error
export const handler = async (req: any, { state, logger }: any) => {
  try {
    const { jobId } = cancelSchema.parse(req.body);
    const key = 'ai-jobs';

    // 1. Get current state
    const job = (await state.get(key, jobId)) as JobState;

    if (!job) {
      return { status: 404, body: { error: 'Job not found' } };
    }

    // 2. Only allow cancelling if it's running
    // We check against the string values to be safe
    if (job.status === 'completed' || job.status === 'failed') {
      return { 
        status: 400, 
        body: { error: 'Cannot cancel a finished job.' } 
      };
    }

    // 3. Flip the switch -> CANCELLED
    await state.set(key, jobId, {
      ...job,
      status: 'cancelled' as JobStatus, 
      updatedAt: new Date().toISOString(),
    });

    logger.warn('Job Cancellation Requested', { jobId });

    return {
      status: 200,
      body: { message: 'Job cancellation signal sent.', jobId },
    };

  } catch (error) {
    return { status: 400, body: { error: 'Invalid Request' } };
  }
};