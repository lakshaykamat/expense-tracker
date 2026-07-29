import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../auth/guards/api-key.guard';
import { LoggedInUser } from '../../../common/decorators/loggedin-user.decorator';
import type { UserDocument } from '../../../auth/schemas/user.schema';
import { ExpensesCrudService } from '../service/expenses-crud.service';
import { ExpensesQueryService } from '../service/expenses-query.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { BulkUpsertExpenseDto } from '../dto/bulk-upsert-expense.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';
import { EXPENSE_CATEGORIES } from '../constants/categories';

@Controller('api/v1/expenses')
@UseGuards(ApiKeyGuard)
export class ExpensesPublicController {
  constructor(
    private readonly crudService: ExpensesCrudService,
    private readonly queryService: ExpensesQueryService,
  ) {}

  @Get()
  findAll(@Query() query: QueryExpenseDto, @LoggedInUser() user: UserDocument) {
    return this.queryService.findAll(
      user._id.toString(),
      query.month,
      query.startDate,
      query.endDate,
      query.groupBy,
      query.limit,
    );
  }

  @Get('categories')
  findCategories() {
    return { categories: EXPENSE_CATEGORIES };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @LoggedInUser() user: UserDocument) {
    return this.crudService.findOne(id, user._id.toString());
  }

  @Post()
  create(@Body() dto: CreateExpenseDto, @LoggedInUser() user: UserDocument) {
    return this.crudService.create(dto, user._id.toString());
  }

  @Post('bulk-upsert')
  bulkUpsert(
    @Body() body: BulkUpsertExpenseDto,
    @LoggedInUser() user: UserDocument,
  ) {
    return this.crudService.bulkUpsert(body.expenses, user._id.toString());
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @LoggedInUser() user: UserDocument,
  ) {
    return this.crudService.update(id, dto as Record<string, unknown>, user._id.toString());
  }

  @Delete(':id')
  remove(@Param('id') id: string, @LoggedInUser() user: UserDocument) {
    return this.crudService.remove(id, user._id.toString());
  }
}
