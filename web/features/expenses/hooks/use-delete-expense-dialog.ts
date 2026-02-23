"use client";

import { useState, useCallback } from "react";
import type { Expense } from "@/types";

/**
 * Encapsulates delete-expense confirmation dialog state and handlers.
 * Use with DeleteExpenseDialog and wire handleDeleteExpense from useExpenseHandlers.
 */
export function useDeleteExpenseDialog(handleDeleteExpense: (id: string) => Promise<void>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteDialog = useCallback((expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  }, [isDeleting]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !isDeleting) {
        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
      }
    },
    [isDeleting]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!expenseToDelete || isDeleting) return;
    setIsDeleting(true);
    await handleDeleteExpense(expenseToDelete._id);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  }, [expenseToDelete, isDeleting, handleDeleteExpense]);

  return {
    deleteDialogOpen,
    expenseToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    onOpenChange,
    handleDeleteConfirm,
    isDeleting,
  };
}
