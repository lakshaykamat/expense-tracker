import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget, BudgetDocument, EssentialItem } from './schemas/budget.schema';

@Injectable()
export class BudgetsService {
  constructor(@InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>) {}

  async create(createBudgetDto: CreateBudgetDto, userId: string) {
    // Check if budget already exists for this month/user
    const existingBudget = await this.budgetModel.findOne({
      userId,
      month: createBudgetDto.month,
    });

    if (existingBudget) {
      throw new BadRequestException('Budget already exists for this month');
    }

    const budget = new this.budgetModel({
      ...createBudgetDto,
      userId,
    });

    return budget.save();
  }

  async findAll(userId: string) {
    const budgets = await this.budgetModel
      .find({ userId })
      .sort({ month: -1 })
      .exec();

    // Add calculated fields
    return budgets.map(budget => ({
      ...budget.toObject(),
      totalBudget: this.calculateTotalBudget(budget.essentialItems),
      spentAmount: this.calculateSpentAmount(budget.essentialItems),
    }));
  }

  async findOne(id: string, userId: string) {
    const budget = await this.budgetModel.findOne({ _id: id, userId });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // Add calculated fields
    return {
      ...budget.toObject(),
      totalBudget: this.calculateTotalBudget(budget.essentialItems),
      spentAmount: this.calculateSpentAmount(budget.essentialItems),
    };
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto, userId: string) {
    const budget = await this.budgetModel.findOneAndUpdate(
      { _id: id, userId },
      updateBudgetDto,
      { new: true }
    );
    
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // Add calculated fields
    return {
      ...budget.toObject(),
      totalBudget: this.calculateTotalBudget(budget.essentialItems),
      spentAmount: this.calculateSpentAmount(budget.essentialItems),
    };
  }

  async remove(id: string, userId: string) {
    const result = await this.budgetModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Budget not found');
    }
  }

  async getCurrentBudget(userId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    let budget = await this.budgetModel.findOne({
      userId,
      month: currentMonth,
    });

    // If no budget exists for current month, try to copy from most recent budget
    if (!budget) {
      budget = await this.copyMostRecentBudget(userId, currentMonth);
    }

    if (!budget) {
      return null;
    }

    // Add calculated fields
    return {
      ...budget.toObject(),
      totalBudget: this.calculateTotalBudget(budget.essentialItems),
      spentAmount: this.calculateSpentAmount(budget.essentialItems),
    };
  }

  async copyMostRecentBudget(userId: string, currentMonth: string) {
    // Find the most recent budget before the current month
    const recentBudget = await this.budgetModel
      .findOne({
        userId,
        month: { $lt: currentMonth },
      })
      .sort({ month: -1 })
      .exec();

    if (!recentBudget) {
      return null;
    }

    // Create new budget for current month based on the most recent budget
    const newBudget = new this.budgetModel({
      userId,
      month: currentMonth,
      essentialItems: recentBudget.essentialItems, // Copy essential items
    });

    return await newBudget.save();
  }

  calculateTotalBudget(essentialItems: EssentialItem[]): number {
    return essentialItems.reduce((total, item) => total + (item.amount || 0), 0);
  }

  calculateSpentAmount(essentialItems: EssentialItem[]): number {
    // For now, calculate based on amounts (this could be updated based on actual expenses)
    return essentialItems.reduce((total, item) => total + (item.amount || 0), 0);
  }

  async addEssentialItem(budgetId: string, item: EssentialItem, userId: string) {
    const budget = await this.budgetModel.findOne({ _id: budgetId, userId });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // Check if essential item with same name already exists
    const existingItem = budget.essentialItems.find(
      (existing) => existing.name === item.name
    );

    if (!existingItem) {
      budget.essentialItems.push(item);
    }
    
    const savedBudget = await budget.save();

    // Add calculated fields
    return {
      ...savedBudget.toObject(),
      totalBudget: this.calculateTotalBudget(savedBudget.essentialItems),
      spentAmount: this.calculateSpentAmount(savedBudget.essentialItems),
    };
  }

  async removeEssentialItem(budgetId: string, itemName: string, userId: string) {
    const budget = await this.budgetModel.findOne({ _id: budgetId, userId });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    budget.essentialItems = budget.essentialItems.filter(
      (item) => item.name !== itemName
    );
    
    const savedBudget = await budget.save();

    // Add calculated fields
    return {
      ...savedBudget.toObject(),
      totalBudget: this.calculateTotalBudget(savedBudget.essentialItems),
      spentAmount: this.calculateSpentAmount(savedBudget.essentialItems),
    };
  }

  async getEssentialItems(budgetId: string, userId: string) {
    const budget = await this.budgetModel.findOne({ _id: budgetId, userId });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return budget.essentialItems;
  }
}
