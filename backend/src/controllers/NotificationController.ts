/**
 * Notification Controller
 * Handles HTTP requests for email/notification operations
 */

import { Request, Response } from 'express';
import { emailService } from '../services/EmailService';
import { EmailOptions } from '../types/EmailOptions';

export class NotificationController {
  /**
   * POST /api/notifications/email
   * Send an email directly
   */
  async sendEmail(req: Request, res: Response): Promise<void> {
    try {
      const emailOptions: EmailOptions = req.body;

      // Validate required fields
      if (!emailOptions.to || !emailOptions.subject || !emailOptions.body) {
        res.status(400).json({
          success: false,
          error: 'to, subject, and body are required',
        });
        return;
      }

      const result = await emailService.sendEmail(emailOptions);

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error || 'Failed to send email',
        });
        return;
      }

      res.json({
        success: true,
        messageId: result.messageId,
        sentAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Email sending error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to send email',
      });
    }
  }
}

