import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { BudgetsController } from './presentation/controllers/budgets.controller';
import { BudgetsService } from './application/budgets.service';
import { Budget } from './domain/schemas/budget.schema';
import { ExpensesService } from '../expenses/application/expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const mockConnection = {
  startSession: () =>
    Promise.resolve({
      withTransaction: (fn: () => Promise<void>) => fn(),
      endSession: () => Promise.resolve(),
    }),
};

describe('BudgetsController', () => {
  let controller: BudgetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetsController],
      providers: [
        BudgetsService,
        { provide: getModelToken(Budget.name), useValue: {} },
        { provide: getConnectionToken(), useValue: mockConnection },
        { provide: ExpensesService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BudgetsController>(BudgetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
