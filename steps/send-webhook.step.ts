/*
import { EventConfig, Handlers } from 'motia';
import { WebhookSender } from '../utils/webhook';

export const config: EventConfig = {
  name: 'SendWebhook',
  type: 'event',
  subscribes: ['ai.webhook.send'],
  flows: ['ai-jobs'],
  infrastructure: {
    handler: { timeout: 10 },
    queue: { maxRetries: 3 },
  },
};

export const handler: Handlers['SendWebhook'] = async (input, { logger }) => {
  const { webhookConfig, event, jobData } = input;
  
  try {
    await WebhookSender.send(webhookConfig, {
      event,
      jobId: jobData.jobId,
      timestamp: new Date().toISOString(),
      data: jobData,
    });
    
    logger.info('Webhook sent successfully', { event, url: webhookConfig.url });
  } catch (error) {
    logger.error('Webhook failed', { error, event });
    throw error; // Will retry up to 3 times
  }
}; */