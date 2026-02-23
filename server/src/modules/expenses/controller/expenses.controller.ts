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
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { LoggedInUser } from '../../../common/decorators/loggedin-user.decorator';
import type { UserDocument } from '../../../auth/schemas/user.schema';
import { ExpensesCrudService } from '../service/expenses-crud.service';
import { ExpensesQueryService } from '../service/expenses-query.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { BulkCreateExpenseDto } from '../dto/bulk-create-expense.dto';
import { BulkUpdateExpenseDto } from '../dto/bulk-update-expense.dto';
import { BulkDeleteExpenseDto } from '../dto/bulk-delete-expense.dto';
import { QueryExpenseDto } from '../dto/query-expense.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly crudService: ExpensesCrudService,
    private readonly queryService: ExpensesQueryService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateExpenseDto,
    @LoggedInUser() user: UserDocument,
  ) {
    return this.crudService.create(dto, user._id.toString());
  }

  @Post('bulk')
  bulkCreate(
    @Body() body: BulkCreateExpenseDto,
    @LoggedInUser() user: UserDocument,
  ) {
    return this.crudService.bulkCreate(body.expenses, user._id.toString());
  }

  @Get()
  findAll(
    @Query() query: QueryExpenseDto,
    @LoggedInUser() user: UserDocument,
  ) {
    return this.queryService.findAll(
      user._id.toString(),
      query.month,
      query.startDate,
      query.endDate,
      query.groupBy,
      query.limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @LoggedInUser() user: UserDocument) {
    return this.crudService.findOne(id, user._id.toString());
  }

  @Patch('bulk')
  bulkUpdate(
    @Body() body: BulkUpdateExpenseDto,
    @LoggedInUser() user: UserDocument,
  ) {
    return this.crudService.bulkUpdate(body.expenses, user._id.toString());
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @LoggedInUser() user: UserDocument,
  ) {
    return this.crudService.update(id, dto as Record<string, unknown>, user._id.toString());
  }

  @Delete('bulk')
  bulkRemove(
    @Body() body: BulkDeleteExpenseDto,
    @LoggedInUser() user: UserDocument,
  ) {
    return this.crudService.bulkRemove(body.ids, user._id.toString());
  }

  @Delete(':id')
  remove(@Param('id') id: string, @LoggedInUser() user: UserDocument) {
    return this.crudService.remove(id, user._id.toString());
  }
}
