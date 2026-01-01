"use client";

import { lazy, Suspense } from "react";
import { useBudgets } from "@/hooks/useBudgets";
import { useBudgetDialog } from "@/hooks/useBudgetDialog";
import { useBudgetHandlers } from "@/hooks/useBudgetHandlers";
import { BudgetDisplay } from '@/components/budget-display'
import { PageLayout } from '@/components/page-layout'
import { BudgetFab } from '@/components/budget-fab'
import { Plus } from "lucide-react";

// Lazy load dialog component (only loads when needed)
const BudgetDialog = lazy(() => import('@/components/budget-dialog').then(module => ({ default: module.BudgetDialog })))

export const dynamic = "force-dynamic";

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
      <Suspense fallback={null}>
        <BudgetDialog
          open={isDialogOpen}
          onOpenChange={closeDialog}
          onSubmit={handleBudgetSubmit}
          editingBudget={editingBudget || undefined}
        />
      </Suspense>
      
      {/* Floating Action Button - Mobile Only */}
      <BudgetFab onClick={() => openAddDialog()}>
        <Plus className="w-6 h-6" />
      </BudgetFab>
    </PageLayout>
  );
}
