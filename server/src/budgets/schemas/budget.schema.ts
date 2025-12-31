import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface EssentialItem {
  name: string;
  amount?: number;
}

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true })
export class Budget {
  @Prop({ required: true })
  month: string; // Format: "YYYY-MM" e.g., "2025-01"

  @Prop({ required: false, default: [] })
  essentialItems: EssentialItem[]; // Array of essential items with amounts

  @Prop({ required: true })
  userId: Types.ObjectId;

  _id: Types.ObjectId;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
