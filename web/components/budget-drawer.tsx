"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Calendar } from "lucide-react";
import type { BudgetDialogProps } from "@/types";
import { useBudgetForm } from "@/hooks/useBudgetForm";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatCurrency } from "@/utils/currency.utils";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";

export function BudgetDrawer({
  onSubmit,
  open,
  onOpenChange,
  editingBudget,
  defaultMonth,
  isLoading = false,
}: BudgetDialogProps) {
  const {
    formData,
    newItemName,
    newItemAmount,
    totalBudget,
    isSubmitDisabled,
    setNewItemName,
    setNewItemAmount,
    handleSubmit,
    addEssentialItem,
    removeEssentialItem,
    setFormDataMonth,
  } = useBudgetForm({
    editingBudget,
    onSubmit,
    open: open ?? false,
    defaultMonth,
  });

  const isMobile = useMediaQuery("(max-width: 767px)");
  const direction = isMobile ? "bottom" : "right";
  const side = isMobile ? "bottom" : "right";

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={direction}
      snapPoints={isMobile ? [0.8] : undefined}
    >
      <DrawerContent
        side={side}
        className={cn(
          "rounded-none",
          isMobile
            ? "max-h-[80dvh] flex flex-col min-h-0"
            : "h-full flex flex-col min-h-0"
        )}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DrawerHeader className="px-4 md:px-6 pt-2 pb-3 border-b border-border/10 shrink-0 text-left">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-xl font-semibold text-foreground">
                  {editingBudget ? "Edit Budget" : "Create Budget"}
                </DrawerTitle>
                <DrawerDescription className="text-sm text-muted-foreground mt-1">
                  Set your monthly budget and essential items
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <div className="px-4 md:px-6 py-4 space-y-4 md:space-y-5">
              <div className="space-y-2 md:space-y-3">
                <Label
                  htmlFor="month"
                  className="text-sm font-medium text-foreground"
                >
                  Month <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <Input
                    id="month"
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
                      e.key === "Enter" &&
                      (e.preventDefault(), addEssentialItem())
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
                        e.key === "Enter" &&
                        (e.preventDefault(), addEssentialItem())
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

                {formData.essentialItems &&
                formData.essentialItems.length > 0 ? (
                  <div className="space-y-2">
                    {formData.essentialItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-base truncate">
                            {item.name}
                          </div>
                          {item.amount && (
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
            </div>

            <div className="shrink-0 border-t border-border/10 bg-background px-4 md:px-6 pb-4 md:pb-6 pt-4 safe-area-inset-bottom">
              <Button
                type="submit"
                disabled={isSubmitDisabled || isLoading}
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
      </DrawerContent>
    </Drawer>
  );
}
