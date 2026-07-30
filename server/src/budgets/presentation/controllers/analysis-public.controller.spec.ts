import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisPublicController } from './analysis-public.controller';
import { BudgetsService } from '../../application/budgets.service';
import type { UserDocument } from '../../../auth/schemas/user.schema';
import { ApiKeyGuard } from '../../../auth/guards/api-key.guard';

describe('AnalysisPublicController', () => {
  let controller: AnalysisPublicController;
  const budgetsService = { getAnalysisStats: jest.fn() };
  const user = {
    _id: { toString: () => 'user-id' },
  } as unknown as UserDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisPublicController],
      providers: [{ provide: BudgetsService, useValue: budgetsService }],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AnalysisPublicController>(AnalysisPublicController);
    budgetsService.getAnalysisStats.mockReset();
  });

  it('returns analysis for the API-key user', () => {
    const analysis = { totalExpenses: 125 };
    budgetsService.getAnalysisStats.mockReturnValue(analysis);

    expect(controller.getAnalysisStats(' 2026-07 ', user)).toBe(analysis);
    expect(budgetsService.getAnalysisStats).toHaveBeenCalledWith(
      'user-id',
      '2026-07',
    );
  });

  it.each([undefined, '2026-7', 'July 2026'])(
    'rejects an invalid month',
    (month) => {
      expect(() => controller.getAnalysisStats(month as string, user)).toThrow(
        BadRequestException,
      );
    },
  );
});
