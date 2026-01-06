import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createEmailTransporter } from './email.config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {}

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      try {
        this.transporter = createEmailTransporter(this.configService);
      } catch (error) {
        this.logger.error('Failed to create email transporter', error);
        throw error;
      }
    }
    return this.transporter;
  }

  async sendWeeklyStats(
    email: string,
    stats: {
      total: number;
      categories: Array<{ category: string; amount: number; count: number }>;
      weekRange: string;
      weekNumber: number;
      startDate: Date;
      endDate: Date;
    },
  ): Promise<void> {
    const html = this.generateEmailTemplate(stats);

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: this.configService.get<string>(
          'SMTP_FROM',
          'Expense Tracker <noreply@expensetracker.com>',
        ),
        to: email,
        subject: `Week ${stats.weekNumber} Spending Summary - ${stats.weekRange}`,
        html,
      });
      this.logger.log(`Weekly stats email sent to ${email}`);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      const errorCode = error?.code || 'UNKNOWN';
      this.logger.error(
        `Failed to send email to ${email}: ${errorCode} - ${errorMessage}`,
      );

      if (errorCode === 'ESOCKET' || errorCode === 'EAUTH') {
        this.logger.error(
          'SMTP connection error. Please check: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables',
        );
      }

      throw error;
    }
  }

  private generateEmailTemplate(stats: {
    total: number;
    categories: Array<{ category: string; amount: number; count: number }>;
    weekRange: string;
    weekNumber: number;
    startDate: Date;
    endDate: Date;
  }): string {
    const primaryColor = '#2563eb';
    const primaryForeground = '#eff6ff';
    const cardBg = '#ffffff';
    const cardForeground = '#1f2937';
    const borderColor = '#e5e7eb';
    const mutedForeground = '#6b7280';

    const formatINR = (amount: number): string => {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const categoryRows = stats.categories
      .map(
        (cat) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid ${borderColor};">${cat.category}</td>
        <td style="padding: 12px; border-bottom: 1px solid ${borderColor}; text-align: right;">${formatINR(cat.amount)}</td>
      </tr>
    `,
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${cardBg}; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 24px; background-color: ${primaryColor}; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: ${primaryForeground}; font-size: 24px; font-weight: 600;">Week ${stats.weekNumber} Spending Summary</h1>
              <p style="margin: 8px 0 0 0; color: ${primaryForeground}; font-size: 14px; opacity: 0.9;">${stats.weekRange}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <div style="background-color: ${primaryForeground}; padding: 20px; border-radius: 6px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; color: ${mutedForeground}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Total Spent</p>
                <p style="margin: 8px 0 0 0; color: ${primaryColor}; font-size: 32px; font-weight: 700;">${formatINR(stats.total)}</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: ${primaryForeground};">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid ${borderColor}; color: ${cardForeground}; font-weight: 600;">Category</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid ${borderColor}; color: ${cardForeground}; font-weight: 600;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoryRows}
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; border-top: 1px solid ${borderColor}; text-align: center;">
              <p style="margin: 0; color: ${mutedForeground}; font-size: 12px;">Expense Tracker</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
