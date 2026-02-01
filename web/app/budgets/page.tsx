"use client";

import { lazy, Suspense, useState } from "react";
import { useBudgets } from "@/hooks/useBudgets";
import { useBudgetDialog } from "@/hooks/useBudgetDialog";
import { useBudgetHandlers } from "@/hooks/useBudgetHandlers";
import { useMonthSelection } from "@/hooks/useMonthSelection";
import { BudgetDisplay } from "@/components/budget-display";
import { PageLayout } from "@/components/page-layout";
import { BudgetFab } from "@/components/budget-fab";
import { Plus } from "lucide-react";

// Lazy load drawer component (only loads when needed)
const BudgetDrawer = lazy(() =>
  import("@/components/budget-drawer").then((module) => ({
    default: module.BudgetDrawer,
  }))
);

export const dynamic = "force-dynamic";

export default function BudgetsPage() {
  const { selectedMonth, setSelectedMonth, availableMonths } =
    useMonthSelection();
  const budgetsHook = useBudgets(selectedMonth);
  const { currentBudget, loading, error } = budgetsHook;

  const dialogHook = useBudgetDialog();
  const { isDialogOpen, editingBudget, openAddDialog, closeDialog } =
    dialogHook;

  const {
    handleBudgetSubmit,
    handleEditBudget,
    handleDeleteBudget,
    handleUpdateItem,
    handleDeleteItem,
  } = useBudgetHandlers({
    budgets: budgetsHook,
    dialog: dialogHook,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBudgetSubmitWithLoading = async (data: any) => {
    setIsSubmitting(true);
    await handleBudgetSubmit(data);
    setIsSubmitting(false);
  };

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
        availableMonths={availableMonths}
        onAddBudget={() => openAddDialog()}
        onEditBudget={handleEditBudget}
        onDeleteBudget={handleDeleteBudget}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />

      {/* Budget Drawer */}
      <Suspense fallback={null}>
        <BudgetDrawer
          open={isDialogOpen}
          onOpenChange={closeDialog}
          onSubmit={handleBudgetSubmitWithLoading}
          editingBudget={editingBudget || undefined}
          defaultMonth={selectedMonth}
          isLoading={isSubmitting}
        />
      </Suspense>

      {/* Floating Action Button - Mobile Only */}
      <BudgetFab onClick={() => openAddDialog()}>
        <Plus className="w-6 h-6" />
      </BudgetFab>
    </PageLayout>
  );
}
