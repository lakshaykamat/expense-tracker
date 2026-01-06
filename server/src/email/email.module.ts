import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from './email.service';
import { WeeklyEmailService } from './weekly-email.service';
import { EmailController } from './email.controller';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Expense, ExpenseSchema } from '../expenses/schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
  ],
  controllers: [EmailController],
  providers: [EmailService, WeeklyEmailService],
  exports: [EmailService],
})
export class EmailModule {}
