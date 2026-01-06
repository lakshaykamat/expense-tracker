import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from './email.service';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Expense, ExpenseDocument } from '../expenses/schemas/expense.schema';
import { toObjectId } from '../common/utils/query.utils';

@Injectable()
export class WeeklyEmailService {
  private readonly logger = new Logger(WeeklyEmailService.name);

  constructor(
    private readonly emailService: EmailService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
  ) {}

  async sendWeeklyEmailsToAll() {
    this.logger.log('Starting weekly email job');

    try {
      const users = await this.userModel.find({}).lean();
      this.logger.log(`Found ${users.length} users to send emails to`);

      const { startDate, endDate, weekRange, weekNumber } =
        this.getLastWeekRange();

      let sentCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      for (const user of users) {
        try {
          const stats = await this.getWeeklyStats(
            user._id.toString(),
            startDate,
            endDate,
          );

          if (stats.total > 0) {
            try {
              await this.emailService.sendWeeklyStats(user.email, {
                ...stats,
                weekRange,
                weekNumber,
                startDate,
                endDate,
              });
              sentCount++;
            } catch (error) {
              this.logger.error(`Failed to send email to ${user.email}`, error);
              failedCount++;
            }
          } else {
            this.logger.log(`Skipping ${user.email} - no expenses last week`);
            skippedCount++;
          }
        } catch (error) {
          this.logger.error(`Failed to process user ${user.email}`, error);
          failedCount++;
        }
      }

      this.logger.log(
        `Weekly email job completed: ${sentCount} sent, ${skippedCount} skipped, ${failedCount} failed`,
      );
      return {
        sent: sentCount,
        skipped: skippedCount,
        failed: failedCount,
        total: users.length,
      };
    } catch (error) {
      this.logger.error('Weekly email job failed', error);
      throw error;
    }
  }

  private getLastWeekRange(): {
    startDate: Date;
    endDate: Date;
    weekRange: string;
    weekNumber: number;
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const lastMonday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    lastMonday.setDate(today.getDate() - daysToSubtract - 7);
    lastMonday.setHours(0, 0, 0, 0);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const getWeekNumber = (date: Date): number => {
      const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      );
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil(
        ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
      );
    };

    const weekNumber = getWeekNumber(lastMonday);

    return {
      startDate: lastMonday,
      endDate: lastSunday,
      weekRange: `${formatDate(lastMonday)} - ${formatDate(lastSunday)}`,
      weekNumber,
    };
  }

  private async getWeeklyStats(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    total: number;
    categories: Array<{ category: string; amount: number; count: number }>;
  }> {
    const expenses = await this.expenseModel
      .find({
        userId: toObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .lean();

    const categoryMap = new Map<string, { amount: number; count: number }>();
    let total = 0;

    for (const expense of expenses) {
      const category = expense.category || 'Uncategorized';
      const existing = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1,
      });
      total += expense.amount;
    }

    const categories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { total, categories };
  }
}
