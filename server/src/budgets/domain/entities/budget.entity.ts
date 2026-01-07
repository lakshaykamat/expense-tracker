export interface EssentialItem {
  name: string;
  amount?: number;
}

export class Budget {
  _id: string;
  userId: string;
  month: string; // Format: "YYYY-MM"
  essentialItems: EssentialItem[];
  totalBudget: number; // Calculated field
  spentAmount: number; // Calculated field
  createdAt: string;
  updatedAt: string;
}
