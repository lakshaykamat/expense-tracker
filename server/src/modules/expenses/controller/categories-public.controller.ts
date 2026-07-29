import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../../auth/guards/api-key.guard';
import { EXPENSE_CATEGORIES } from '../constants/categories';

@Controller('api/v1/categories')
@UseGuards(ApiKeyGuard)
export class CategoriesPublicController {
  @Get()
  findAll() {
    return { categories: EXPENSE_CATEGORIES };
  }
}
