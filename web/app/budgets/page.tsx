"use client";

import { lazy, Suspense } from "react";
import {
  useBudgets,
  useBudgetDialog,
  useBudgetHandlers,
  BudgetDisplay,
  BudgetFab,
} from "@/features/budgets";
import { useMonthSelection } from "@/shared/hooks/use-month-selection";
import { PageLayout } from "@/shared/components/page-layout";
import { Plus, Pencil } from "lucide-react";

// Lazy load drawer component (only loads when needed)
const BudgetDrawer = lazy(() =>
  import("@/features/budgets").then((module) => ({
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
    handleBudgetSubmitWithLoading,
    isSubmitting,
    handleEditBudget,
    handleDeleteBudget,
    handleUpdateItem,
    handleDeleteItem,
  } = useBudgetHandlers({
    budgets: budgetsHook,
    dialog: dialogHook,
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

      {/* Floating Action Button - Mobile only; contextual: Edit when budget exists, Add when none */}
      <BudgetFab
        onClick={() =>
          currentBudget
            ? handleEditBudget(currentBudget)
            : openAddDialog()
        }
      >
        {currentBudget ? (
          <Pencil className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </BudgetFab>
    </PageLayout>
  );
}
