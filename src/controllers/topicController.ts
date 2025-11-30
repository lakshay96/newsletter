import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { validationResult } from 'express-validator';

/**
 * Create a new topic
 */
export const createTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, description } = req.body;

    const topic = await prisma.topic.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: topic,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Topic with this name already exists',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create topic',
      error: error.message,
    });
  }
};

/**
 * Get all topics
 */
export const getAllTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        _count: {
          select: {
            subscribers: true,
            contents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics',
      error: error.message,
    });
  }
};

/**
 * Get a single topic by ID
 */
export const getTopicById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        subscribers: true,
        contents: {
          orderBy: {
            scheduledTime: 'desc',
          },
        },
      },
    });

    if (!topic) {
      res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic',
      error: error.message,
    });
  }
};

/**
 * Update a topic
 */
export const updateTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
      data: topic,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update topic',
      error: error.message,
    });
  }
};

/**
 * Delete a topic
 */
export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.topic.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete topic',
      error: error.message,
    });
  }
};

