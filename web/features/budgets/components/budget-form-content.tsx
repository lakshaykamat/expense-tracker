"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Plus, X, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/currency.utils";
import type { CreateBudgetData, EssentialItem } from "@/types";

/**
 * Shared form body for budget create/edit (month + essential items).
 * Used by BudgetDrawer and BudgetDialog so both stay in sync.
 */
export interface BudgetFormContentProps {
  formData: CreateBudgetData;
  newItemName: string;
  newItemAmount: string;
  totalBudget: number;
  setNewItemName: (v: string) => void;
  setNewItemAmount: (v: string) => void;
  setFormDataMonth: (v: string) => void;
  addEssentialItem: () => void;
  removeEssentialItem: (index: number) => void;
}

export function BudgetFormContent({
  formData,
  newItemName,
  newItemAmount,
  totalBudget,
  setNewItemName,
  setNewItemAmount,
  setFormDataMonth,
  addEssentialItem,
  removeEssentialItem,
}: BudgetFormContentProps) {
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="space-y-2 md:space-y-3">
        <Label htmlFor="budget-form-month" className="text-sm font-medium text-foreground">
          Month <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Calendar className="w-4 h-4" />
          </div>
          <Input
            id="budget-form-month"
            type="month"
            value={formData.month}
            onChange={(e) => setFormDataMonth(e.target.value)}
            required
            className="h-10 md:h-11 text-base pl-10"
          />
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Essential Items
          </Label>
          <div className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalBudget)}
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 h-9 md:h-10 text-base"
            minLength={3}
            maxLength={100}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addEssentialItem())
            }
          />
          <div className="relative flex-1">
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none text-base">
              ₹
            </div>
            <Input
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0.01"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              className="w-full h-9 md:h-10 text-base pl-6 pr-2"
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addEssentialItem())
              }
            />
          </div>
          <Button
            type="button"
            onClick={addEssentialItem}
            size="sm"
            className="h-9 md:h-10 px-2 md:px-3 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.essentialItems && formData.essentialItems.length > 0 ? (
          <div className="space-y-2">
            {formData.essentialItems.map((item: EssentialItem & { name: string; amount?: number }, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base truncate">{item.name}</div>
                  {item.amount != null && (
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.amount)}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEssentialItem(index)}
                  className="h-7 w-7 md:h-8 md:w-8 p-0 shrink-0"
                >
                  <X className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 md:py-4 border-2 border-dashed border-muted">
            <div className="text-sm text-muted-foreground">
              No essential items added yet
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Add items above to get started
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
