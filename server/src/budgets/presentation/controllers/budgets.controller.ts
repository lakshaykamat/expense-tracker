import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { BudgetsService } from '../../application/budgets.service';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { type EssentialItem } from '../../domain/schemas/budget.schema';
import { convertToCSV } from '../../../common/utils/csv.utils';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto, @Request() req) {
    return this.budgetsService.create(createBudgetDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.budgetsService.findAll(req.user.userId);
  }

  @Get('current')
  getCurrent(@Request() req) {
    return this.budgetsService.getCurrentBudget(req.user.userId);
  }

  @Get('month/:month')
  findByMonth(@Param('month') month: string, @Request() req) {
    return this.budgetsService.findByMonth(req.user.userId, month);
  }

  @Get('analysis/stats')
  getAnalysisStats(@Query('month') month: string, @Request() req) {
    if (!month) {
      throw new BadRequestException('Month parameter is required');
    }
    return this.budgetsService.getAnalysisStats(req.user.userId, month);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.budgetsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Request() req,
  ) {
    return this.budgetsService.update(id, updateBudgetDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.budgetsService.remove(id, req.user.userId);
  }

  @Post(':id/essential-items')
  addEssentialItem(
    @Param('id') id: string,
    @Body() essentialItem: EssentialItem,
    @Request() req,
  ) {
    return this.budgetsService.addEssentialItem(
      id,
      essentialItem,
      req.user.userId,
    );
  }

  @Delete(':id/essential-items')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEssentialItem(
    @Param('id') id: string,
    @Body('name') name: string,
    @Request() req,
  ) {
    return this.budgetsService.removeEssentialItem(id, name, req.user.userId);
  }

  @Get(':id/essential-items')
  getEssentialItems(@Param('id') id: string, @Request() req) {
    return this.budgetsService.getEssentialItems(id, req.user.userId);
  }
}
