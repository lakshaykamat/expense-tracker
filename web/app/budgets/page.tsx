"use client";

import { lazy, Suspense, useState } from "react";
import { useBudgets } from "@/hooks/useBudgets";
import { useBudgetDialog } from "@/hooks/useBudgetDialog";
import { useBudgetHandlers } from "@/hooks/useBudgetHandlers";
import { BudgetDisplay } from '@/components/budget-display'
import { PageLayout } from '@/components/page-layout'
import { BudgetFab } from '@/components/budget-fab'
import { Plus } from "lucide-react";
import { getCurrentMonth } from '@/utils/date.utils';

// Lazy load dialog component (only loads when needed)
const BudgetDialog = lazy(() => import('@/components/budget-dialog').then(module => ({ default: module.BudgetDialog })))

export const dynamic = "force-dynamic";

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth())
  const budgetsHook = useBudgets(selectedMonth);
  const {
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
        budgets={[]}
        currentBudget={currentBudget}
        loading={loading}
        error={error}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
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
          defaultMonth={selectedMonth}
        />
      </Suspense>
      
      {/* Floating Action Button - Mobile Only */}
      <BudgetFab onClick={() => openAddDialog()}>
        <Plus className="w-6 h-6" />
      </BudgetFab>
    </PageLayout>
  );
}
