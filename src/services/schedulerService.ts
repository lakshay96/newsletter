import cron from 'node-cron';
import { prisma } from '../config/database';
import { sendNewsletterEmail } from './emailService';

/**
 * Check and send scheduled newsletters
 * This function runs every minute to check if any content needs to be sent
 */
export const checkAndSendScheduledContent = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Find all content that should be sent (scheduled time has passed and not yet sent)
    const contentToSend = await prisma.content.findMany({
      where: {
        scheduledTime: {
          lte: now,
        },
        sent: false,
      },
      include: {
        topic: {
          include: {
            subscribers: {
              where: {
                active: true,
              },
            },
          },
        },
      },
    });

    if (contentToSend.length === 0) {
      console.log(`[${new Date().toISOString()}] No scheduled content to send`);
      return;
    }

    console.log(`[${new Date().toISOString()}] Found ${contentToSend.length} content(s) to send`);

    // Process each content
    for (const content of contentToSend) {
      const subscribers = content.topic.subscribers;
      
      if (subscribers.length === 0) {
        console.log(`⚠️  No subscribers for topic: ${content.topic.name}`);
        // Mark as sent even if no subscribers
        await prisma.content.update({
          where: { id: content.id },
          data: { sent: true, sentAt: new Date() },
        });
        continue;
      }

      console.log(`📧 Sending "${content.title}" to ${subscribers.length} subscriber(s)`);

      // Send to each subscriber
      for (const subscriber of subscribers) {
        const success = await sendNewsletterEmail(
          subscriber.email,
          content.title,
          content.body
        );

        // Log the send attempt
        await prisma.sentLog.create({
          data: {
            contentId: content.id,
            subscriberId: subscriber.id,
            status: success ? 'success' : 'failed',
            errorMessage: success ? null : 'Failed to send email',
          },
        });
      }

      // Mark content as sent
      await prisma.content.update({
        where: { id: content.id },
        data: { sent: true, sentAt: new Date() },
      });

      console.log(`✅ Completed sending content: ${content.title}`);
    }
  } catch (error) {
    console.error('❌ Error in scheduler:', error);
  }
};

/**
 * Initialize the cron job scheduler
 * Runs every minute to check for scheduled content
 */
export const initializeScheduler = (): void => {
  // Run every minute: '* * * * *'
  // Reference: https://www.npmjs.com/package/node-cron
  cron.schedule('* * * * *', async () => {
    await checkAndSendScheduledContent();
  });

  console.log('✅ Scheduler initialized - checking every minute for scheduled content');
};

