export class ExpenseResponseDto {
  _id: string;
  title: string;
  amount: number;
  description?: string;
  category?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

