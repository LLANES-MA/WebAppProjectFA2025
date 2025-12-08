/**
 * Email/Notification Service
 * Handles sending emails via SMTP/email provider
 */

import nodemailer from 'nodemailer';
import { EmailOptions } from '../types/EmailOptions';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private enabled: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailFrom = process.env.EMAIL_FROM || emailUser;

    // Only initialize if email configuration is provided
    if (emailHost && emailPort && emailUser && emailPass) {
      this.transporter = nodemailer.createTransporter({
        host: emailHost,
        port: parseInt(emailPort),
        secure: false, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      this.enabled = true;
      console.log('✅ Email service initialized');
    } else {
      console.warn('⚠️  Email service not configured. Emails will be logged to console only.');
      this.enabled = false;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.enabled || !this.transporter) {
      // Log email to console in development mode
      console.log('📧 Email (dev mode):', {
        to: options.to,
        subject: options.subject,
        body: options.body.substring(0, 100) + '...',
        timestamp: new Date().toISOString(),
      });
      return {
        success: true,
        messageId: 'dev-mode-' + Date.now().toString(),
      };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        text: options.body,
        html: options.html || options.body.replace(/\n/g, '<br>'),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send pending approval email to restaurant
   */
  async sendPendingApprovalEmail(email: string, restaurantName: string): Promise<void> {
    const subject = 'Your restaurant registration is pending approval';
    const body = `
Dear ${restaurantName},

Thank you for registering with FrontDash!

We have received your restaurant registration application and it is currently pending admin approval.

What happens next:
- Our team will review your restaurant information and menu details
- This process typically takes 2-3 business days
- You'll receive another email once your account has been approved

Once approved, you'll receive your login credentials and access to your restaurant dashboard where you can:
- Manage your menu
- Track orders
- Update your restaurant information
- View analytics and reports

If you have any questions, please don't hesitate to contact our support team at support@frontdash.com.

Thank you for choosing FrontDash!

Best regards,
The FrontDash Team
    `.trim();

    await this.sendEmail({
      to: email,
      subject,
      body,
    });
  }

  /**
   * Send approval email with login credentials
   */
  async sendApprovalEmail(
    email: string,
    restaurantName: string,
    username: string,
    temporaryPassword: string,
    loginUrl: string = 'http://localhost:3000/restaurant-signin'
  ): Promise<void> {
    const subject = 'Your restaurant has been approved – login details inside';
    const body = `
Dear ${restaurantName},

Great news! Your restaurant account has been approved and you can now access FrontDash!

Your Login Credentials:
Username: ${username}
Temporary Password: ${temporaryPassword}

IMPORTANT: Please log in and change your password immediately for security purposes.

Login URL: ${loginUrl}

Next Steps:
1. Log in using the credentials above
2. Change your temporary password to something secure
3. Complete your restaurant profile setup
4. Add your menu items and photos
5. Start accepting orders!

If you have any questions or need assistance, please contact our support team:
- Email: support@frontdash.com
- Phone: 1-800-FRONTDASH

We're excited to have you on board!

Best regards,
The FrontDash Team
    `.trim();

    await this.sendEmail({
      to: email,
      subject,
      body,
    });
  }
}

// Singleton instance
export const emailService = new EmailService();

