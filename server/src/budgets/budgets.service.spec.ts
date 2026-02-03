import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { BudgetsService } from './application/budgets.service';
import { Budget } from './domain/schemas/budget.schema';
import { ExpensesService } from '../expenses/application/expenses.service';

const mockConnection = {
  startSession: () =>
    Promise.resolve({
      withTransaction: (fn: () => Promise<void>) => fn(),
      endSession: () => Promise.resolve(),
    }),
};

describe('BudgetsService', () => {
  let service: BudgetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: getModelToken(Budget.name), useValue: {} },
        { provide: getConnectionToken(), useValue: mockConnection },
        { provide: ExpensesService, useValue: {} },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
