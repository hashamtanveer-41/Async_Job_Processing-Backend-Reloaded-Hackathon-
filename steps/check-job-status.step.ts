import { ApiRouteConfig, Handlers } from 'motia';
import { JobState } from '../utils/errors';

export const config: ApiRouteConfig = {
  name: 'CheckJobStatus',
  type: 'api',
  path: '/ai/status/:jobId',
  method: 'GET',
  emits: [], 
  flows: ['ai-jobs'],
};

export const handler: Handlers['CheckJobStatus'] = async (req, { state, logger }) => {
  const { jobId } = req.pathParams; 

  try {
    //Validate Input (Basic check)
    if (!jobId || jobId.length < 5) {
        return {
            status: 400,
            body: { error: 'Invalid Job ID format' }
        };
    }

    // 2. Fetch from State
    const job = (await state.get('ai-jobs', jobId)) as JobState | null;

    //Handle "Not Found"
    if (!job) {
      logger.warn('Job lookup failed - ID not found', { jobId });
      return {
        status: 404,
        body: { 
            error: 'Job not found', 
            message: `No job exists with ID: ${jobId}` 
        },
      };
    }

    //Return Success (The Job Status)
    logger.info('Job status retrieved', { jobId, status: job.status });

    return {
      status: 200,
      body: {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress || null, 
        result: job.result || null, 
        error: job.error || null,  
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    };

  } catch (error) {
    logger.error('Failed to retrieve job status', { jobId, error });
    return {
      status: 500,
      body: { error: 'Internal Server Error' },
    };
  }
};