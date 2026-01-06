import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { WeeklyEmailService } from './weekly-email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly weeklyEmailService: WeeklyEmailService) {}

  @Post('send-weekly')
  @HttpCode(HttpStatus.OK)
  async sendWeeklyEmails() {
    try {
      const result = await this.weeklyEmailService.sendWeeklyEmailsToAll();
      return {
        message: 'Weekly emails sent successfully',
        ...result,
      };
    } catch (error: any) {
      if (error.message?.includes('SMTP credentials')) {
        throw new HttpException(
          {
            message: 'Email service not configured',
            error:
              'SMTP credentials are missing. Please configure SMTP_USER and SMTP_PASS environment variables.',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        {
          message: 'Failed to send weekly emails',
          error: error.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
