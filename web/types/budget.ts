export interface EssentialItem {
  name: string;
  amount?: number;
}

export interface Budget {
  _id: string;
  userId: string;
  month: string;
  essentialItems: EssentialItem[];
  totalBudget: number;
  spentAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetData {
  month: string;
  essentialItems?: EssentialItem[];
}

export interface UpdateBudgetData {
  month?: string;
  essentialItems?: EssentialItem[];
}
