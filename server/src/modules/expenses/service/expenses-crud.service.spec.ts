import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExpensesCrudService } from './expenses-crud.service';
import { ExpensesRepository } from '../repository/expenses.repository';

describe('ExpensesCrudService', () => {
  let service: ExpensesCrudService;
  let repository: jest.Mocked<Pick<ExpensesRepository, 'create' | 'findById' | 'update' | 'delete' | 'bulkCreate' | 'bulkDelete'>>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
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
});
