import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from './entities/expense.schema';
import { ExpensesRepository } from './repository/expenses.repository';
import { ExpensesCrudService } from './service/expenses-crud.service';
import { ExpensesQueryService } from './service/expenses-query.service';
import { ExpensesController } from './controller/expenses.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
    AuthModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesRepository, ExpensesCrudService, ExpensesQueryService],
  exports: [ExpensesQueryService, ExpensesCrudService],
})
export class ExpensesModule {}
