"use client";

import type { Budget, CreateBudgetData } from "@/types";
import { useBudgetForm } from "../hooks/use-budget-form";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";
import { BudgetDrawerShell } from "./budget-drawer-shell";
import { BudgetDrawerHeader } from "./budget-drawer-header";
import { BudgetFormContent } from "./budget-form-content";

interface BudgetDrawerProps {
  onSubmit: (data: CreateBudgetData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingBudget?: Budget | null;
  defaultMonth?: string;
  isLoading?: boolean;
}

export function BudgetDrawer({
  onSubmit,
  open,
  onOpenChange,
  editingBudget,
  defaultMonth,
  isLoading = false,
}: BudgetDrawerProps) {
  const form = useBudgetForm({
    editingBudget,
    onSubmit,
    open: open ?? false,
    defaultMonth,
  });

  const isMobile = useMediaQuery("(max-width: 767px)");
  const direction = isMobile ? "bottom" : "right";

  return (
    <BudgetDrawerShell
      open={!!open}
      onOpenChange={onOpenChange}
      direction={direction}
      snapPoints={isMobile ? [0.8] : undefined}
      isMobile={isMobile}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <BudgetDrawerHeader editingBudget={editingBudget ?? null} />

        <form
          onSubmit={form.handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="px-4 md:px-6 py-4">
              <BudgetFormContent
                formData={form.formData}
                newItemName={form.newItemName}
                newItemAmount={form.newItemAmount}
                totalBudget={form.totalBudget}
                setNewItemName={form.setNewItemName}
                setNewItemAmount={form.setNewItemAmount}
                setFormDataMonth={form.setFormDataMonth}
                addEssentialItem={form.addEssentialItem}
                removeEssentialItem={form.removeEssentialItem}
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-border/10 bg-background px-4 md:px-6 pb-4 md:pb-6 pt-4">
            <Button
              type="submit"
              disabled={form.isSubmitDisabled || isLoading}
              className="w-full h-10 md:h-11 text-base font-medium"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>{editingBudget ? "Updating..." : "Creating..."}</span>
                </div>
              ) : editingBudget ? (
                "Update Budget"
              ) : (
                "Create Budget"
              )}
            </Button>
          </div>
        </form>
      </div>
    </BudgetDrawerShell>
  );
}
