"use client";

import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Expense } from "@/types";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency.utils";
import { Edit, Trash2 } from "lucide-react";

interface SwipeableExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const SWIPE_THRESHOLD = 80;

export function SwipeableExpenseItem({
  expense,
  onEdit,
  onDelete,
}: SwipeableExpenseItemProps) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handlers = useSwipeable({
    onSwiping: ({ deltaX }) => {
      setSwiping(true);
      setOffset(Math.max(-120, Math.min(120, deltaX)));
    },
    onSwipedLeft: ({ deltaX }) => {
      setSwiping(false);
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        onEdit(expense);
        setTimeout(() => setOffset(0), 100);
      } else {
        setOffset(0);
      }
    },
    onSwipedRight: ({ deltaX }) => {
      setSwiping(false);
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        onDelete(expense);
        setTimeout(() => setOffset(0), 100);
      } else {
        setOffset(0);
      }
    },
    onSwiped: () => {
      setSwiping(false);
      if (Math.abs(offset) < SWIPE_THRESHOLD) setOffset(0);
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 10,
  });

  const isEditVisible = offset < -20;
  const isDeleteVisible = offset > 20;

  return (
    <div className="relative overflow-hidden">
      {/* Edit background - right side */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 bg-primary flex items-center justify-center"
        style={{ opacity: isEditVisible ? 1 : 0 }}
      >
        <div className="flex flex-col items-center text-primary-foreground">
          <span className="text-xs font-medium">Edit</span>
        </div>
      </div>

      {/* Delete background - left side */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 bg-destructive flex items-center justify-center"
        style={{ opacity: isDeleteVisible ? 1 : 0 }}
      >
        <div className="flex flex-col items-center text-destructive-foreground">
          <span className="text-xs font-medium text-white">Delete</span>
        </div>
      </div>

      {/* Main content */}
      <div
        {...handlers}
        className={`relative bg-card px-6 py-6 flex items-center justify-between ${
          swiping ? "" : "transition-transform duration-200 ease-out"
        }`}
        style={{ transform: `translateX(${offset}px)` }}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-light text-foreground truncate mb-1">
            {expense.title}
          </h3>
          {expense.description && (
            <p className="text-sm text-muted-foreground truncate">
              {expense.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(expense.date), "MMM d")}
            {expense.category && ` · ${expense.category.toUpperCase()}`}
          </p>
        </div>
        <div className="text-base font-light text-foreground">
          {formatCurrency(expense.amount)}
        </div>
      </div>
    </div>
  );
}
