import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { BudgetsModule } from '../budgets/budgets.module';

@Module({
  imports: [AuthModule, ExpensesModule, BudgetsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
