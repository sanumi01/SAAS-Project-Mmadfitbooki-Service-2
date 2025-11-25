// Email Notification Service using AWS SES
import { SESClient, SendEmailCommand, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';
import { awsConfig } from '../config/aws-config';

const sesClient = new SESClient({ region: awsConfig.ses.region });

export interface EmailTemplate {
  templateName: string;
  templateData: { [key: string]: string };
}

export interface EmailNotification {
  to: string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  from?: string;
}

export class EmailService {
  // Send basic email
  static async sendEmail(notification: EmailNotification): Promise<void> {
    const command = new SendEmailCommand({
      Source: notification.from || awsConfig.ses.fromEmail,
      Destination: {
        ToAddresses: notification.to,
      },
      Message: {
        Subject: {
          Data: notification.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: notification.htmlBody,
            Charset: 'UTF-8',
          },
          ...(notification.textBody && {
            Text: {
              Data: notification.textBody,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    });

    await sesClient.send(command);
  }

  // Send templated email
  static async sendTemplatedEmail(
    to: string[],
    template: EmailTemplate,
    from?: string
  ): Promise<void> {
    const command = new SendTemplatedEmailCommand({
      Source: from || awsConfig.ses.fromEmail,
      Destination: {
        ToAddresses: to,
      },
      Template: template.templateName,
      TemplateData: JSON.stringify(template.templateData),
    });

    await sesClient.send(command);
  }

  // Booking confirmation email
  static async sendBookingConfirmation(
    userEmail: string,
    userName: string,
    trainerName: string,
    bookingDate: string,
    bookingTime: string,
    serviceType: string
  ): Promise<void> {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #086ADD, #0A4F9E); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .booking-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MMAD FitBooki</h1>
          <h2>Booking Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>Your fitness session has been confirmed! Here are your booking details:</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <p><strong>Trainer:</strong> ${trainerName}</p>
            <p><strong>Service:</strong> ${serviceType}</p>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${bookingTime}</p>
          </div>
          
          <p>Please arrive 10 minutes early for your session. If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
          
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>The MMAD FitBooki Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 MMAD FitBooki. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: [userEmail],
      subject: 'Booking Confirmation - MMAD FitBooki',
      htmlBody,
      textBody: `Dear ${userName}, your fitness session with ${trainerName} on ${bookingDate} at ${bookingTime} has been confirmed.`
    });
  }

  // Booking reminder email
  static async sendBookingReminder(
    userEmail: string,
    userName: string,
    trainerName: string,
    bookingDate: string,
    bookingTime: string
  ): Promise<void> {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #086ADD, #0A4F9E); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MMAD FitBooki</h1>
          <h2>Session Reminder</h2>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          
          <div class="reminder-box">
            <h3>🔔 Reminder: Your session is tomorrow!</h3>
            <p><strong>Trainer:</strong> ${trainerName}</p>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${bookingTime}</p>
          </div>
          
          <p>Don't forget to bring your workout gear and arrive 10 minutes early!</p>
          <p>See you soon!</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: [userEmail],
      subject: 'Session Reminder - Tomorrow at ' + bookingTime,
      htmlBody
    });
  }

  // Welcome email for new users
  static async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #086ADD, #0A4F9E); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .welcome-box { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to MMAD FitBooki!</h1>
        </div>
        <div class="content">
          <div class="welcome-box">
            <h2>Hello ${userName}! 👋</h2>
            <p>Welcome to MMAD FitBooki - your personal fitness scheduling platform!</p>
          </div>
          
          <h3>What you can do:</h3>
          <ul>
            <li>📅 Book sessions with certified trainers</li>
            <li>💪 Create personalized workout plans</li>
            <li>📊 Track your fitness progress</li>
            <li>🔄 Manage your bookings easily</li>
          </ul>
          
          <p>Ready to start your fitness journey? Log in to your account and book your first session!</p>
          
          <p>If you have any questions, don't hesitate to reach out to our support team.</p>
          
          <p>Let's get fit together!</p>
          <p>The MMAD FitBooki Team</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: [userEmail],
      subject: 'Welcome to MMAD FitBooki! 🎉',
      htmlBody
    });
  }

  // Cancellation notification
  static async sendCancellationNotification(
    userEmail: string,
    userName: string,
    trainerName: string,
    bookingDate: string,
    bookingTime: string
  ): Promise<void> {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .cancellation-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MMAD FitBooki</h1>
          <h2>Booking Cancelled</h2>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          
          <div class="cancellation-box">
            <h3>Your booking has been cancelled</h3>
            <p><strong>Trainer:</strong> ${trainerName}</p>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${bookingTime}</p>
          </div>
          
          <p>We're sorry to see this session cancelled. You can book a new session anytime through your dashboard.</p>
          
          <p>Thank you for using MMAD FitBooki!</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: [userEmail],
      subject: 'Booking Cancelled - MMAD FitBooki',
      htmlBody
    });
  }
}

export default EmailService;