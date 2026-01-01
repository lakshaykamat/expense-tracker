"use client";

import { useBudgets } from "@/hooks/useBudgets";
import { useBudgetDialog } from "@/hooks/useBudgetDialog";
import { useBudgetHandlers } from "@/hooks/useBudgetHandlers";
import { BudgetDisplay } from '@/components/budget-display'
import { PageLayout } from '@/components/page-layout'
import { BudgetDialog } from '@/components/budget-dialog'
import { BudgetFab } from '@/components/budget-fab'
import { Plus } from "lucide-react";

export default function BudgetsPage() {
  const budgetsHook = useBudgets();
  const {
    budgets,
    currentBudget,
    loading,
    error,
  } = budgetsHook;

  const dialogHook = useBudgetDialog();
  const {
    isDialogOpen,
    editingBudget,
    openAddDialog,
    closeDialog,
  } = dialogHook;

  const {
    handleBudgetSubmit,
    handleEditBudget,
    handleDeleteBudget,
    handleUpdateItem,
    handleDeleteItem
  } = useBudgetHandlers({
    budgets: budgetsHook,
    dialog: dialogHook
  });

  return (
    <PageLayout>
      {/* Budget Display */}
      <BudgetDisplay
        budgets={budgets}
        currentBudget={currentBudget}
        loading={loading}
        error={error}
        onAddBudget={() => openAddDialog()}
        onEditBudget={handleEditBudget}
        onDeleteBudget={handleDeleteBudget}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />

      {/* Budget Dialog */}
      <BudgetDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        onSubmit={handleBudgetSubmit}
        editingBudget={editingBudget || undefined}
      />
      
      {/* Floating Action Button - Mobile Only */}
      <BudgetFab onClick={() => openAddDialog()}>
        <Plus className="w-6 h-6" />
      </BudgetFab>
    </PageLayout>
  );
}
