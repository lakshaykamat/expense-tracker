"use client";

import { Drawer, DrawerContent } from "@/shared/components/ui/drawer";
import { cn } from "@/lib/utils";

interface BudgetDrawerShellProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  direction: "left" | "right" | "top" | "bottom";
  snapPoints?: number[];
  isMobile: boolean;
  children: React.ReactNode;
}

export function BudgetDrawerShell({
  open,
  onOpenChange = () => {},
  direction,
  snapPoints,
  isMobile,
  children,
}: BudgetDrawerShellProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={direction} snapPoints={snapPoints}>
      <DrawerContent
        className={cn(
          "rounded-none",
          isMobile
            ? "h-[80dvh] max-h-[80dvh] flex flex-col min-h-0"
            : "h-full flex flex-col min-h-0"
        )}
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
}
