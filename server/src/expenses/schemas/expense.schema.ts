import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: false })
    description?: string;

    @Prop({ required: false })
    category?: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    userId: Types.ObjectId

    _id: Types.ObjectId;
}
export const ExpenseSchema = SchemaFactory.createForClass(Expense);



