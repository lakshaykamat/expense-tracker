import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { WeeklyEmailService } from './weekly-email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly weeklyEmailService: WeeklyEmailService) {}

  @Post('send-weekly')
  @HttpCode(HttpStatus.OK)
  async sendWeeklyEmails() {
    const result = await this.weeklyEmailService.sendWeeklyEmailsToAll();
    return {
      message: 'Weekly emails sent successfully',
      ...result,
    };
  }
}
