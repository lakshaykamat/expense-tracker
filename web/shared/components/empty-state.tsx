"use client";

import { Card, CardContent } from "./ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center min-h-[40vh] gap-4 py-12">
        {icon && (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-2">
            {icon}
          </div>
        )}
        <div className="text-center">
          <h3 className="text-base font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
