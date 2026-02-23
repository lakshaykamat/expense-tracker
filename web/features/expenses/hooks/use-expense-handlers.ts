import { useCallback } from "react";
import { CreateExpenseData } from "@/types";
import { UseExpensesReturn } from "@/types";
import { UseExpenseDialogReturn } from "@/types";

interface UseExpenseHandlersOptions {
  expenses: UseExpensesReturn;
  dialog: UseExpenseDialogReturn;
}

export function useExpenseHandlers({
  expenses,
  dialog,
}: UseExpenseHandlersOptions) {
  const { addExpense, updateExpense, deleteExpense } = expenses;
  const { closeDialog } = dialog;

  const handleAddExpense = useCallback(
    async (data: CreateExpenseData) => {
      const result = await addExpense(data);
      if (result.success) {
        closeDialog();
        // Cache is already invalidated by addExpense, SWR will refetch in background
      }
    },
    [addExpense, closeDialog]
  );

  const handleUpdateExpense = useCallback(
    async (data: CreateExpenseData) => {
      if (!dialog.editingExpense) return;

      const result = await updateExpense(dialog.editingExpense._id, data);
      if (result.success) {
        closeDialog();
        // Cache is already invalidated by updateExpense, SWR will refetch in background
      }
    },
    [
      updateExpense,
      dialog.editingExpense,
      closeDialog,
    ]
  );

  const handleDeleteExpense = useCallback(
    async (id: string) => {
      await deleteExpense(id);
    },
    [deleteExpense]
  );

  return {
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
  };
}
