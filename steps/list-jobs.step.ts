// ===================================
// FILE: src/steps/list-jobs.step.ts
// ===================================

import { ApiRouteConfig, Handlers } from 'motia';
import { JobState } from '../utils/errors';

export const config: ApiRouteConfig = {
  name: 'ListJobs',
  type: 'api',
  path: '/ai/jobs',
  method: 'GET',
  emits: [], // Vital: Fixes the "missing property" error
  flows: ['ai-jobs'],
};

export const handler: Handlers['ListJobs'] = async (req, { state, logger }) => {
  try {
    logger.info('Fetching all jobs...');

    // 1. Get All Jobs
    // "getGroup" retrieves all keys starting with 'ai-jobs'
    const jobsMap = await state.getGroup('ai-jobs');

    if (!jobsMap) {
        return {
            status: 200,
            body: { jobs: [], total: 0 }
        };
    }

    // 2. Convert & Sort
    // The state comes back as an object { "job-1": {...}, "job-2": {...} }
    // We convert it to an array so the frontend can list it easily
    const jobList = Object.values(jobsMap)
      .map((job) => job as JobState) // Safe cast
      .sort((a, b) => 
        // Sort by Newest First
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    // 3. Return List
    return {
      status: 200,
      body: {
        jobs: jobList,
        total: jobList.length,
      },
    };

  } catch (error) {
    logger.error('Failed to list jobs', { error });
    return {
      status: 500,
      body: { error: 'Internal Server Error' },
    };
  }
};