"use client";

import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";

interface BudgetDrawerHeaderProps {
  editingBudget: unknown | null;
}

export function BudgetDrawerHeader({ editingBudget }: BudgetDrawerHeaderProps) {
  return (
    <DrawerHeader className="px-4 md:px-6 pt-2 pb-3 border-b border-border/10 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="w-10 shrink-0" aria-hidden />
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
          <DrawerTitle className="text-xl font-semibold text-foreground">
            {editingBudget ? "Edit Budget" : "Create Budget"}
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground mt-1">
            Set your monthly budget and essential items
          </DrawerDescription>
        </div>
        <DrawerClose asChild>
          <Button variant="ghost" size="icon" className="shrink-0 w-10 h-10">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DrawerClose>
      </div>
    </DrawerHeader>
  );
}
