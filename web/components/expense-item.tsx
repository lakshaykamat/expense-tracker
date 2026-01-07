"use client";

import { Expense } from "@/types";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency.utils";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  return (
    <div className="px-6 py-6 flex items-center justify-between hover:bg-muted/50 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="mb-1">
          <h3 className="text-base font-light text-foreground truncate">
            {expense.title}
          </h3>
        </div>
        {expense.description && (
          <p className="text-sm text-muted-foreground truncate">
            {expense.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(expense.date), "MMM d")}
          {expense.category && (
            <span className="ml-1"> · {expense.category.toUpperCase()}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(expense)}
            className="h-8 w-8 p-0"
            aria-label="Edit expense"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(expense)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete expense"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-base font-light text-foreground">
          {formatCurrency(expense.amount)}
        </div>
      </div>
    </div>
  );
}
