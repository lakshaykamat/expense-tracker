"use client";

import { useState, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { Expense } from "@/types";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency.utils";

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
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const initialDelta = useRef<{ x: number; y: number } | null>(null);

  const handlers = useSwipeable({
    onSwiping: ({ deltaX, deltaY, first }) => {
      // On first movement, determine if this is a horizontal or vertical gesture
      if (first) {
        initialDelta.current = { x: deltaX, y: deltaY };
        isHorizontalSwipe.current = null;
      }

      // Determine direction based on movement
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Only determine direction if we've moved enough (15px threshold)
      if (isHorizontalSwipe.current === null && (absX > 15 || absY > 15)) {
        isHorizontalSwipe.current = absX > absY;
      }

      // Only handle horizontal swipes - update offset and swiping state
      if (isHorizontalSwipe.current === true) {
        setSwiping(true);
        setOffset(Math.max(-120, Math.min(120, deltaX)));
      } else if (isHorizontalSwipe.current === false) {
        // Vertical scroll - reset everything and don't interfere
        setSwiping(false);
        setOffset(0);
      }
    },
    onSwipedLeft: ({ deltaX }) => {
      setSwiping(false);
      const absX = Math.abs(deltaX);

      // Trigger if it was determined to be horizontal (or not yet determined but not vertical)
      // AND threshold met AND we actually moved horizontally (offset was set)
      const wasHorizontal =
        isHorizontalSwipe.current === true ||
        (isHorizontalSwipe.current !== false && absX >= SWIPE_THRESHOLD);

      if (wasHorizontal && absX >= SWIPE_THRESHOLD) {
        // Reset refs immediately
        isHorizontalSwipe.current = null;
        initialDelta.current = null;

        // Call callback to open dialog immediately
        onEdit(expense);

        // Reset offset after a brief delay
        setTimeout(() => setOffset(0), 150);
      } else {
        // Not a valid swipe - reset everything
        setOffset(0);
        isHorizontalSwipe.current = null;
        initialDelta.current = null;
      }
    },
    onSwipedRight: ({ deltaX }) => {
      setSwiping(false);
      const absX = Math.abs(deltaX);

      // Trigger if it was determined to be horizontal (or not yet determined but not vertical)
      // AND threshold met AND we actually moved horizontally (offset was set)
      const wasHorizontal =
        isHorizontalSwipe.current === true ||
        (isHorizontalSwipe.current !== false && absX >= SWIPE_THRESHOLD);

      if (wasHorizontal && absX >= SWIPE_THRESHOLD) {
        // Reset refs immediately
        isHorizontalSwipe.current = null;
        initialDelta.current = null;

        // Call callback to open dialog immediately
        onDelete(expense);

        // Reset offset after a brief delay
        setTimeout(() => setOffset(0), 150);
      } else {
        // Not a valid swipe - reset everything
        setOffset(0);
        isHorizontalSwipe.current = null;
        initialDelta.current = null;
      }
    },
    onSwiped: () => {
      setSwiping(false);
      if (Math.abs(offset) < SWIPE_THRESHOLD) {
        setOffset(0);
      }
      isHorizontalSwipe.current = null;
      initialDelta.current = null;
    },
    trackMouse: false,
    preventScrollOnSwipe: false,
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
