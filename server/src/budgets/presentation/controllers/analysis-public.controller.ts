import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../auth/guards/api-key.guard';
import { LoggedInUser } from '../../../common/decorators/loggedin-user.decorator';
import type { UserDocument } from '../../../auth/schemas/user.schema';
import { isValidMonthFormat } from '../../../common/utils/validation.utils';
import { BudgetsService } from '../../application/budgets.service';

@Controller('api/v1/budgets/analysis')
@UseGuards(ApiKeyGuard)
export class AnalysisPublicController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get('stats')
  getAnalysisStats(
    @Query('month') month: string,
    @LoggedInUser() user: UserDocument,
  ) {
    const trimmed = typeof month === 'string' ? month.trim() : '';
    if (!trimmed) {
      throw new BadRequestException('Month parameter is required');
    }
    if (!isValidMonthFormat(trimmed)) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM');
    }

    return this.budgetsService.getAnalysisStats(user._id.toString(), trimmed);
  }
}
