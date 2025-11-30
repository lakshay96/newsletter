import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { validationResult } from 'express-validator';

/**
 * Create new content
 */
export const createContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { topicId, title, body, scheduledTime } = req.body;

    const content = await prisma.content.create({
      data: {
        topicId,
        title,
        body,
        scheduledTime: new Date(scheduledTime),
      },
      include: {
        topic: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message,
    });
  }
};

/**
 * Get all content
 */
export const getAllContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topicId, sent } = req.query;

    const where: any = {};
    if (topicId) where.topicId = topicId as string;
    if (sent !== undefined) where.sent = sent === 'true';

    const contents = await prisma.content.findMany({
      where,
      include: {
        topic: true,
        _count: {
          select: {
            sentLogs: true,
          },
        },
      },
      orderBy: {
        scheduledTime: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: contents,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message,
    });
  }
};

/**
 * Get a single content by ID
 */
export const getContentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        topic: true,
        sentLogs: {
          include: {
            subscriber: true,
          },
        },
      },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: 'Content not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message,
    });
  }
};

/**
 * Update content
 */
export const updateContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, body, scheduledTime } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (body !== undefined) updateData.body = body;
    if (scheduledTime !== undefined) updateData.scheduledTime = new Date(scheduledTime);

    const content = await prisma.content.update({
      where: { id },
      data: updateData,
      include: {
        topic: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: content,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Content not found',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message,
    });
  }
};

/**
 * Delete content
 */
export const deleteContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.content.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Content not found',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message,
    });
  }
};

/**
 * Get content statistics
 */
export const getContentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalContent = await prisma.content.count();
    const sentContent = await prisma.content.count({ where: { sent: true } });
    const pendingContent = await prisma.content.count({ where: { sent: false } });
    const totalSentLogs = await prisma.sentLog.count();
    const successfulSends = await prisma.sentLog.count({ where: { status: 'success' } });
    const failedSends = await prisma.sentLog.count({ where: { status: 'failed' } });

    res.status(200).json({
      success: true,
      data: {
        totalContent,
        sentContent,
        pendingContent,
        totalSentLogs,
        successfulSends,
        failedSends,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};

