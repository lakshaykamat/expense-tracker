"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBudgets } from "@/hooks/useBudgets";
import { useBudgetDialog } from "@/hooks/useBudgetDialog";
import { BudgetDisplay } from '@/components/budget-display'
import { PageLayout } from '@/components/page-layout'
import { BudgetDialog } from '@/components/budget-dialog'
import { BudgetFab } from '@/components/budget-fab'
import { Plus } from "lucide-react";
import type { CreateBudgetData } from "@/types";

export default function BudgetsPage() {
  const {
    budgets,
    currentBudget,
    loading,
    error,
    fetchBudgets,
    fetchCurrentBudget,
    addBudget,
    updateBudget,
    deleteBudget,
    addEssentialItem,
    removeEssentialItem,
  } = useBudgets();

  const {
    isDialogOpen,
    editingBudget,
    openAddDialog,
    openEditDialog,
    closeDialog,
  } = useBudgetDialog();

  const handleBudgetSubmit = async (data: CreateBudgetData) => {
    const result = editingBudget
      ? await updateBudget(editingBudget._id, data)
      : await addBudget(data);

    if (result.success) {
      closeDialog();
      await fetchBudgets();
    }
  };

  const handleEditBudget = (budget: any) => {
    openEditDialog(budget);
  };

  const handleDeleteBudget = async (id: string) => {
    const result = await deleteBudget(id);
    if (result.success) {
      await fetchBudgets();
    }
  };


  const handleUpdateItem = async (budgetId: string, itemName: string, amount: number) => {
    // Find the budget and update the specific item
    const budget = budgets.find(b => b._id === budgetId);
    if (budget) {
      const updatedBudget = {
        ...budget,
        essentialItems: budget.essentialItems.map(item => 
          item.name === itemName 
            ? { ...item, amount }
            : item
        )
      };
      await updateBudget(budgetId, updatedBudget);
      await fetchBudgets();
    }
  };

  const handleDeleteItem = async (budgetId: string, itemName: string) => {
    const budget = budgets.find(b => b._id === budgetId);
    if (budget) {
      const updatedBudget = {
        ...budget,
        essentialItems: budget.essentialItems.filter(item => item.name !== itemName)
      };
      await updateBudget(budgetId, updatedBudget);
      await fetchBudgets();
    }
  };

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
