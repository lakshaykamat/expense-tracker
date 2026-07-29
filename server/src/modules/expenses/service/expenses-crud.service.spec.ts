import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExpensesCrudService } from './expenses-crud.service';
import { ExpensesRepository } from '../repository/expenses.repository';

describe('ExpensesCrudService', () => {
  let service: ExpensesCrudService;
  let repository: jest.Mocked<Pick<ExpensesRepository, 'create' | 'findById' | 'findByIds' | 'update' | 'delete' | 'bulkCreate' | 'bulkDelete'>>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      bulkCreate: jest.fn(),
      bulkDelete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesCrudService,
        { provide: ExpensesRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<ExpensesCrudService>(ExpensesCrudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should reject invalid user id', async () => {
    await expect(
      service.create(
        { title: 'Test', amount: 10, date: '2025-01-01' },
        'invalid-id',
      ),
    ).rejects.toThrow(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('findOne should throw NotFoundException when expense not found', async () => {
    (repository.findById as jest.Mock).mockResolvedValue(null);
    await expect(
      service.findOne('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'),
    ).rejects.toThrow(NotFoundException);
  });

  it('bulkUpsert should update identified expenses and create new expenses', async () => {
    const userId = '507f1f77bcf86cd799439012';
    const expenseId = '507f1f77bcf86cd799439011';
    const updatedExpense = { _id: expenseId, title: 'Lunch', amount: 15 };
    const createdExpense = { _id: '507f1f77bcf86cd799439013', title: 'Coffee', amount: 4 };
    repository.findByIds.mockResolvedValue([updatedExpense]);
    repository.update.mockResolvedValue(updatedExpense);
    repository.bulkCreate.mockResolvedValue([createdExpense]);

    await expect(
      service.bulkUpsert(
        [
          { _id: expenseId, title: 'Lunch', amount: 15, date: '2026-07-20' },
          { title: 'Coffee', amount: 4, date: '2026-07-21' },
        ],
        userId,
      ),
    ).resolves.toMatchObject({ created: 1, updated: 1, expenses: [updatedExpense, createdExpense] });

    expect(repository.findByIds).toHaveBeenCalledWith([expenseId], userId);
    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.bulkCreate).toHaveBeenCalledTimes(1);
    expect(repository.update.mock.calls[0][2]).not.toHaveProperty('$unset');
  });

  it('bulkUpsert should reject an expense that does not belong to the user', async () => {
    repository.findByIds.mockResolvedValue([]);

    await expect(
      service.bulkUpsert(
        [{ _id: '507f1f77bcf86cd799439011', title: 'Lunch', amount: 15 }],
        '507f1f77bcf86cd799439012',
      ),
    ).rejects.toThrow(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
