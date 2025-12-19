// ===================================
// FILE: src/steps/start-ai-job.step.ts
// ===================================

import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { JobStatus, JobState } from '../utils/errors';
import { RateLimiter} from '../utils/rate-limiter';

const startJobSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt too long'),
  options: z.object({
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().min(1).max(4000).optional(),
  }).optional(),
});

export const config: ApiRouteConfig = {
  name: 'StartAIJob',
  type: 'api',
  path: '/ai/start',
  method: 'POST',
  emits: ['ai.job.created'],
  flows: ['ai-jobs'],
  bodySchema: startJobSchema,
};

export const handler: Handlers['StartAIJob'] = async (req, { emit, state, logger }) => {
  try {
    // 🛡️ RATE LIMIT CHECK (The Bouncer)
    // In a real app, use req.headers['user-id']. For now, we simulate a user.
    const userId = "demo-user"; 
    
    const limitCheck = await RateLimiter.check(userId, state);

    if (!limitCheck.allowed) {
        logger.warn('Rate limit exceeded', { userId });
        return {
            status: 429, // "Too Many Requests"
            body: { 
                error: 'Rate Limit Exceeded', 
                message: 'You can only start 2 jobs per minute. Please wait.' 
            }
        };
    }
    const { prompt, options } = startJobSchema.parse(req.body);

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    logger.info('Received Start Job Request', { jobId });

    const initialJobState: JobState = {
      jobId,
      status: JobStatus.PENDING,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await state.set('ai-jobs', jobId, initialJobState);

    // FIX: Cast emit to 'any' to bypass the error until types regenerate
    await (emit as any)({
      topic: 'ai.job.created',
      data: {
        jobId,
        prompt,
        options
      },
    });

    return {
      status: 201,
      body: {
        jobId,
        status: JobStatus.PENDING,
        message: 'Job started successfully.',
        remaining_credits: limitCheck.remaining 
      },
    };

  } catch (error) {
    logger.error('Failed to start job', { error });
    return {
      status: 500,
      body: { error: 'Internal Server Error' },
    };
  }
};