"use client";

import { PageHeaderSkeleton } from "./page-header-skeleton";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function ExpenseListSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton showButton={true} />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

