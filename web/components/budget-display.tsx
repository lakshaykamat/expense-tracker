"use client";

import React from "react";
import type { Budget } from "@/types";
import { PageHeader } from "./page-header";
import { EmptyState } from "./empty-state";
import { BudgetDisplaySkeleton } from "./budget-display-skeleton";
import { ErrorDisplay } from "./error-display";
import { formatMonthDisplay } from "@/utils/date.utils";
import { formatCurrency } from "@/utils/currency.utils";

interface BudgetDisplayProps {
  budgets: Budget[];
  currentBudget: Budget | null;
  loading: boolean;
  error: string | null;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
  onAddBudget?: () => void;
  onEditBudget?: (budget: Budget) => void;
  onDeleteBudget?: (budgetId: string) => void;
  onUpdateItem?: (budgetId: string, itemName: string, amount: number) => void;
  onDeleteItem?: (budgetId: string, itemName: string) => void;
}

export function BudgetDisplay({
  currentBudget,
  loading,
  error,
  selectedMonth,
  onMonthChange,
  availableMonths,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
  onUpdateItem,
  onDeleteItem,
}: BudgetDisplayProps) {
  if (loading) {
    return (
      <BudgetDisplaySkeleton />
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          buttonText="Add Budget"
          onButtonClick={onAddBudget}
        />
        <ErrorDisplay
          error={error}
          title="Failed to load budget data"
          onRetry={() => window.location.reload()}
          variant="default"
        />
      </div>
    );
  }

  const displayBudget = currentBudget;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        onMonthChange={onMonthChange}
        buttonText={displayBudget ? "Edit Budget" : "Add Budget"}
        onButtonClick={
          displayBudget
            ? () => onEditBudget && onEditBudget(displayBudget)
            : onAddBudget
        }
      />

      {/* Main Content */}
      {displayBudget &&
      displayBudget.essentialItems &&
      displayBudget.essentialItems.length > 0 ? (
        <div>
          {/* Total Budget Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6 mb-6 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-foreground">
                  Total Budget
                </h3>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-foreground">
                  {formatCurrency(displayBudget.totalBudget)}
                </div>
              </div>
            </div>
          </div>

          {/* Essential Items List */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {displayBudget.essentialItems.map((item, index) => (
                <div
                  key={index}
                  className="px-6 py-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-light text-foreground truncate">
                      {item.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.amount && displayBudget.totalBudget > 0
                        ? `${Math.round(
                            (item.amount / displayBudget.totalBudget) * 100
                          )}% of budget`
                        : "No amount"}
                    </div>
                  </div>
                  <div className="text-base font-light text-foreground">
                    {item.amount ? formatCurrency(item.amount) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title={
            selectedMonth
              ? `No budget for ${formatMonthDisplay(selectedMonth)}`
              : "No budget found"
          }
          description={
            selectedMonth
              ? `Create a budget for ${formatMonthDisplay(
                  selectedMonth
                )} to get started`
              : "Create your first budget to start tracking your expenses"
          }
          icon={
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20.25 7.5l-.625 10.532a2.25 2.25 0 01-1.592.659l-5.433-5.433a2.25 2.25 0 00-3.184 0l-5.433 5.433a2.25 2.25 0 00-1.592.659L3.75 7.5m6 0l5.832-5.832m0 0a2.25 2.25 0 003.184 0l5.433 5.433a2.25 2.25 0 001.592-.659L20.25 7.5"
              />
            </svg>
          }
        />
      )}
    </div>
  );
}
