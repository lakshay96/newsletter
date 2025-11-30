import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { validationResult } from 'express-validator';

/**
 * Create a new subscriber
 */
export const createSubscriber = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, name, topicIds } = req.body;

    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        name,
        topics: {
          connect: topicIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        topics: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Subscriber created successfully',
      data: subscriber,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Subscriber with this email already exists',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create subscriber',
      error: error.message,
    });
  }
};

/**
 * Get all subscribers
 */
export const getAllSubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscribers = await prisma.subscriber.findMany({
      include: {
        topics: true,
        _count: {
          select: {
            sentLogs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: subscribers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers',
      error: error.message,
    });
  }
};

/**
 * Get a single subscriber by ID
 */
export const getSubscriberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const subscriber = await prisma.subscriber.findUnique({
      where: { id },
      include: {
        topics: true,
        sentLogs: {
          include: {
            content: true,
          },
          orderBy: {
            sentAt: 'desc',
          },
        },
      },
    });

    if (!subscriber) {
      res.status(404).json({
        success: false,
        message: 'Subscriber not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: subscriber,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriber',
      error: error.message,
    });
  }
};

/**
 * Update a subscriber
 */
export const updateSubscriber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, name, active, topicIds } = req.body;

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (active !== undefined) updateData.active = active;

    if (topicIds !== undefined) {
      updateData.topics = {
        set: topicIds.map((topicId: string) => ({ id: topicId })),
      };
    }

    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: updateData,
      include: {
        topics: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Subscriber updated successfully',
      data: subscriber,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Subscriber not found',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update subscriber',
      error: error.message,
    });
  }
};

/**
 * Subscribe to topics
 */
export const subscribeToTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { topicIds } = req.body;

    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: {
        topics: {
          connect: topicIds.map((topicId: string) => ({ id: topicId })),
        },
      },
      include: {
        topics: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Subscribed to topics successfully',
      data: subscriber,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to topics',
      error: error.message,
    });
  }
};

/**
 * Unsubscribe from topics
 */
export const unsubscribeFromTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { topicIds } = req.body;

    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: {
        topics: {
          disconnect: topicIds.map((topicId: string) => ({ id: topicId })),
        },
      },
      include: {
        topics: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Unsubscribed from topics successfully',
      data: subscriber,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from topics',
      error: error.message,
    });
  }
};

/**
 * Delete a subscriber
 */
export const deleteSubscriber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.subscriber.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Subscriber not found',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber',
      error: error.message,
    });
  }
};

