import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggedInUser } from '../common/decorators/loggedin-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) { }

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @LoggedInUser() user: UserDocument) {
    return this.expensesService.create(createExpenseDto, user._id.toString());
  }

  @Get()
  findAll(@LoggedInUser() user: UserDocument) {
    return this.expensesService.findAll(user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string, @LoggedInUser() user: UserDocument) {
    return this.expensesService.findOne(id, user._id.toString());
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @LoggedInUser() user: UserDocument) {
    return this.expensesService.update(id, updateExpenseDto, user._id.toString());
  }

  @Delete(':id')
  remove(@Param('id') id: string, @LoggedInUser() user: UserDocument) {
    return this.expensesService.remove(id, user._id.toString());
  }
}
